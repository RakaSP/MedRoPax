from copy import copy
from typing import Tuple, List, Optional

from uuid import uuid4

import numpy as np

from item.box import Box
from item.item import Item
from item.medicine import Medicine
from packing.packing import pack_items_to_boxes


class Order:
    def __init__(self,
                 id: int,
                 customer_name: str,
                 item_list: List[Item],
                 coord: Tuple[float, float]):
        self.item_list: List[Item] = item_list
        self.packed_item_list: List[Item] = None
        self.num_item = len(item_list)
        self.num_item_packed = 0
        self.coord = coord
        self.vehicle = None
        self.customer_name = customer_name
        self.id = id
        self.weight = sum([item.weight for item in self.item_list])

    def pack_items_into_cardboard_boxes(self,
                                        box_list: List[Box],
                                        zeta: float,
                                        insertion_mode: str,
                                        construction_mode: str):
        """_summary_

        Args:
            box_list (List[Box]): _description_
            zeta (float): _description_
            insertion_mode (str): _description_
            construction_mode (str): _description_
        """
        item_list = copy(self.item_list)
        used_box, unpacked_items = pack_items_to_boxes(
            box_list, item_list, zeta, insertion_mode, construction_mode)
        
        for bi, box in enumerate(used_box):
            used_box[bi].id = uuid4().int
            # used_box[bi].visualize_packed_items()
        self.packed_item_list = used_box + unpacked_items
        self.num_item_packed = len(self.packed_item_list)

    def reset(self,
              position_list: Optional[List[np.ndarray]] = None,
              insertion_order_list: Optional[List[int]] = None,
              rotate_count_list: Optional[List[int]] = None):
        if position_list:
            for i, item in enumerate(self.packed_item_list):
                self.packed_item_list[i].position = position_list[i]
                self.packed_item_list[i].insertion_order = insertion_order_list[i]
                self.packed_item_list[i].rotate_count = rotate_count_list[i]
        else:
            for i, item in enumerate(self.packed_item_list):
                self.packed_item_list[i].position = None
                self.packed_item_list[i].insertion_order = 0
                self.packed_item_list[i].rotate_count = 0

    def to_dict(self):
        return {
            "id": self.id,
            "customer_name": self.customer_name,
            "item_list": [_.id for _ in self.item_list],
            "coord": self.coord
        }

    @classmethod
    def from_dict(cls, data, product_types):
        """Reconstruct the object from a dictionary."""
        return cls(
            id=data["id"],
            customer_name=data["customer_name"],
            # item_list = [Medicine.from_dict(_) for _ in data["item_list"]],
            item_list=Medicine.from_id(product_types, data["item_list"]),
            coord=data["coord"]
        )
