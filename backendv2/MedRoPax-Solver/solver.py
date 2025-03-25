import pathlib
from random import seed
from typing import Tuple
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


def run(args)->Tuple[Solution, float]:
    problem: VRP3D = read_instance_from_json(args.instance_filename)
    
    for order in problem.order_list:
        order.pack_items_into_cardboard_boxes(problem.cardboard_list, args.min_cardboard_utility, args.insertion_mode, args.construction_mode)
    solution = saving(problem, args.insertion_mode, args.construction_mode)
    cost = problem.total_cost
    return problem, solution, cost

def run_all_params(args):
    best_solution: Solution = None
    best_prob: VRP3D = None
    best_solution_cost: float = 999999
    for insertion_mode in ["first-fit","best-fit"]:
        args.insertion_mode = insertion_mode
        for i, construction_mode in enumerate(["wall-building", "layer-building","column-building"]):
            args.construction_mode = construction_mode
            if insertion_mode == "best-fit" and i>0:
                continue
            for zeta in [0.5, 0.6, 0.7, 0.8, 0.9, 0.95]:
                args.min_cardboard_utility = zeta
                prob, solution, cost = run(args)
                if cost < best_solution_cost:
                    best_prob, best_solution = prob, solution
                    best_solution_cost = cost
    return best_prob, best_solution, cost
        

if __name__ == "__main__":
    seed(datetime.datetime.now().timestamp())
    args = prepare_args()
    solution: Solution
    problem: VRP3D
    if args.best_config_mode:
        problem, solution, cost = run_all_params(args)
    else:
        problem, solution, cost = run(args)
    generate_loading_plans(problem,  args.result_filename)
    save_solution_to_json(solution, args.result_filename)

