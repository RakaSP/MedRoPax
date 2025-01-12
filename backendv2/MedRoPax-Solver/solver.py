from random import seed
import datetime

import json
import sys

from vns.saving import saving
from vns.route_dp import improve_tours_by_dp
from vrp3d.vrp3d import VRP3D

from vrp3d.solution import Solution


def serialize_to_file(obj, file_path):
    with open(file_path, "w") as file:
        json.dump(obj.to_dict(), file)

def deserialize_from_file(cls, file_path):
    with open(file_path, "r") as file:
        data = json.load(file)
    return cls.from_dict(data)


def run():
    problem = deserialize_from_file(VRP3D, sys.argv[1])

    # solution = deserialize_from_file(Solution, "sys.argv[2]")
    for order in problem.order_list:
        order.pack_items_into_cardboard_boxes(problem.cardboard_list)
    solution = saving(problem)
    problem.reset(solution)
    
    # solution = improve_tours_by_dp(solution, problem)
    # problem.reset(solution)
        

    serialize_to_file(solution, sys.argv[2])

if __name__ == "__main__":
    seed(datetime.datetime.now().timestamp())
    run()