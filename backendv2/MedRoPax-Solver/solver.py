import pathlib
from random import seed
import datetime

import json
import sys
import os
import shutil

from arguments import prepare_args
from vns.saving import saving
from vns.route_dp import improve_tours_by_dp
from vrp3d.vrp3d import VRP3D
from vrp3d.solution import Solution
from pdfgenerator.pdfgenerator import generate_vehicle_shipment_pdf


def generate_loading_plans(problem: VRP3D, file_path: str):
    file_path = file_path.split('.')[0]
    if os.path.exists(file_path) and os.path.isdir(file_path):
        shutil.rmtree(file_path)
    os.mkdir(file_path)
    for i, vec in enumerate(problem.vehicle_list):
        generate_vehicle_shipment_pdf(
            vec.box, f"{file_path}/Loading-Plan-{i}.pdf")


def save_solution_to_json(solution:Solution, result_filename:str):
    file_path = pathlib.Path()/result_filename
    with open(file_path.absolute(), "w") as file:
        json.dump(solution.to_dict(), file)


def read_instance_from_json(instance_filename)->VRP3D:
    file_path = pathlib.Path()/instance_filename
    with open(file_path.absolute(), "r") as file:
        data = json.load(file)
    return VRP3D.from_dict(data)


def run(args):
    problem: VRP3D = read_instance_from_json(args.instance_filename)
    # solution = deserialize_from_file(Solution, "sys.argv[2]")
    for order in problem.order_list:
        order.pack_items_into_cardboard_boxes(problem.cardboard_list, args.min_cardboard_utility, args.insertion_mode, args.construction_mode)
    solution = saving(problem, args.insertion_mode, args.construction_mode)
    generate_loading_plans(problem,  args.result_filename)
    problem.reset(solution)
    # solution = improve_tours_by_dp(solution, problem)
    # problem.reset(solution)
    save_solution_to_json(solution, args.result_filename)


if __name__ == "__main__":
    seed(datetime.datetime.now().timestamp())
    args = prepare_args()
    run(args)
