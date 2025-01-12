from typing import List, Tuple
from item.box import Box
from item.medicine import Medicine
from item.item import Item

import numpy as np
"""
    tour_list: tour of each vehicle
    packing_position_list: for each order, there are items (meds+dus),
        each item has its position in the vehicles' box
    ep_list: current ep_list for each vehicles' box
    weight_cost_list: weight cost for each vehicle
    distance_cost_list: travelled distance cost for each vehicle

    having a duplicate of problem in each solution is expensive,
    when deepcopying, 
    what if we have the exact state of problem in the solution,
    and have the problem object replicate
    this state each time modification is done
"""
class Solution:
    def __init__(self,
                 num_vehicle:int,
                 num_order:int) -> None:
        self.num_vehicle = num_vehicle
        self.num_order = num_order
        self.tour_list: List[List[int]] = [[] for _ in range(num_vehicle)]
        self.packing_position_list: List[List[np.ndarray]] = [[] for _ in range(num_order)]
        self.ep_list: List[np.ndarray] = [[np.zeros((3,), dtype=np.int64)] for _ in range(num_vehicle)]
        self.arrival_time_list: List[List[int]] = [[] for _ in range(num_vehicle)]
        self.insertion_order_list: List[List[int]] = [[] for _ in range(num_order)]
        self.rotate_count_list: List[List[int]] = [[] for _ in range(num_order)]
        self.packing_information: List[List[Item]] = [[] for _ in range(num_vehicle)]
        

    def to_dict(self):
        tour_list = [[int(_) for _ in sublist] for sublist in self.tour_list]

        packing_information = []
        for vec_box in self.packing_information:
            cur_vec_box_info = []
            for item_ in vec_box:
                if isinstance(item_, Medicine):
                    dict_ = {
                        "type" : "item",
                        "id" : item_.id,
                        "pos" : item_.position.tolist(),
                        "size" : item_.size.tolist()
                    }
                elif isinstance(item_, Box):
                    dict_ = {
                        "type" : "box",
                        "id" : item_.id,
                        "pos" : item_.position.tolist(),
                        "size" : item_.size.tolist(),
                        "packed_items" : []
                    }
                    item_.packed_items = sorted(item_.packed_items, key=lambda item: item.insertion_order)
                    for packed_item in item_.packed_items:
                        dict__ = {
                            "type" : "item",
                            "id" : packed_item.id,
                            "pos" : packed_item.position.tolist(),
                            "size" : packed_item.size.tolist()
                        }
                        dict_["packed_items"] += [dict__]
                cur_vec_box_info += [dict_]
            packing_information += [cur_vec_box_info]


        return {
                "num_vehicle" : self.num_vehicle,
                "num_order" : self.num_order,
                "tour_list" : tour_list,
                "arrival_time_list" : self.arrival_time_list,
                "packing_information" : packing_information,
            }
    
    # @classmethod
    # def from_dict(cls, data):
    #     """Reconstruct the object from a dictionary."""

    #     packing_position_list = [
    #         [np.array(inner_list) for inner_list in sublist]
    #         for sublist in data["packing_position_list"]
    #     ]

    #     ep_list = [
    #         [np.array(inner_list) for inner_list in sublist]
    #         for sublist in data["ep_list"]
    #     ]

    #     solution = Solution(data["num_vehicle"], data["num_order"])
    #     solution.tour_list = data["tour_list"]
    #     solution.packing_position_list = packing_position_list
    #     solution.ep_list = ep_list
    #     solution.arrival_time_list = data["arrival_time_list"]
    #     solution.insertion_order_list = data["insertion_order_list"]
    #     solution.rotate_count_list = data["rotate_count_list"]
    #     return solution
    