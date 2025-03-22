import enum
from typing import Tuple
import copy

import numpy as np

from item.item import Item

"""
    size: tuple (width, length, height) or (dx, dy, dz) or (span in x-axes, span in y-axes, span in z-axes)
    weigth: mass in gram
    position: (x,y,z) position in the Box, relative to left-bottom-deep-most corner of the item or (x=0,y=0,z=0)
"""
# class Medicine(Item):
#     def __init__(self,
#                  id:int,
#                  order_id:str,
#                  customer_id:str,
#                  product_id:str,
#                  number:int,
#                  uom: str, 
#                  size:np.ndarray, 
#                  weight:int,
#                  temp_class:int,
#                  is_cito:bool):
#         super(Medicine, self).__init__(id, size, product_id)        
#         self.weight = weight
#         self.temp_class = temp_class
#         self.order_id = order_id
#         self.customer_id = customer_id
#         self.product_id = product_id
#         self.number = number
#         self.uom = uom
#         self.is_cito = is_cito
        
    #@property
    #def id(self)->str:
    #    return self.order_id+"-"+self.customer_id+\
    #        "-"+self.product_id+"-"+str(self.number)




class Medicine(Item):
    def __init__(self, 
                 id: int,
                 weight: float,
                 size: np.ndarray,
                 need_refrigeration: bool,
                 is_fragile: bool,
                 name: str = "dummy_medicine_name"
                 ):
        super(Medicine, self).__init__(id, size, name=name)
        self.id = id
        self.weight = weight
        self.need_refrigeration = need_refrigeration
        self.is_fragile = is_fragile

    def to_dict(self):
        return {
            "id": self.id,
            "weight" : self.weight, 
            "size" : self.size.tolist(),
            "need_refrigeration" : self.need_refrigeration,
            "is_fragile" : self.is_fragile,
            "name" : self.name
            }
    
    @classmethod
    def from_dict(cls, data):
        """Reconstruct the object from a dictionary."""
        return cls(
            id = data["id"],
            weight = data["weight"],
            size = np.array(data["size"]),
            need_refrigeration = data["need_refrigeration"],
            is_fragile = data["is_fragile"],
            name = data["name"]
        )
    
    def from_id(product_types, ids):
        items = []
        for id in ids:
            print(id)
            found_item = next((item for item in product_types if item.id == id), None)
            print(found_item)
            items += [copy.deepcopy(found_item)]
        return items