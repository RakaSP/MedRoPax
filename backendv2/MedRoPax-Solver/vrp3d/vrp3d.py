from itertools import chain
from typing import List, Tuple, Optional, Dict

# from googlemaps.distance_matrix import distance_matrix as gmaps_distance_matrix
# import googlemaps
import numpy as np
from sklearn.metrics.pairwise import haversine_distances


from item.item import Item
from item.medicine import Medicine
from item.cardboard import Cardboard
from order.order import Order
from vehicle.vehicle import Vehicle, create_vehicle
from vrp3d.solution import Solution
from vrp3d.utils import compute_tour_list_length

import copy

# def get_real_distance_matrix(coords):
#     num_nodes = len(coords)
#     origins = [(coords[i,0], coords[i,1]) for i in range(num_nodes)]
#     destinations = origins
#     gmaps = googlemaps.Client(key="YOUR_KEY")
#     dm = gmaps_distance_matrix(gmaps, 
#                                or igins,
#                                destinations,
#                                mode='driving',
#                                units='metric')
#     distance_matrix = np.zeros((num_nodes,num_nodes), dtype=float)
#     for i in range(len(coords)):
#         row = dm["rows"][i]['elements']
#         for j in range(len(coords)):
#             distance = float(row[j]['distance']['value'])/1000
#             distance_matrix[i,j] = distance
#     return distance_matrix

class VRP3D:
    def __init__(self,
                product_types: List[Medicine],
                vehicle_list: List[Vehicle],
                order_list: List[Order],
                cardboard_list: List[Cardboard],
                depot_coord: Tuple[float,float],
                max_duration: float,
                distance_matrix: Optional[List[List[float]]] = None,
                velocity:int=40):
        
        self.product_types = product_types
        self.cardboard_list = cardboard_list

        self.vehicle_list: List[Vehicle] = vehicle_list
        # we sort vehicle based on their worthiness.
        # no idea what it actually is, now its just 
        # average of cost per kg and cost per km
        self.vehicle_list = sorted(vehicle_list, key=lambda vhc: (vhc.cost_per_kg+vhc.cost_per_km)/2)

        self.order_list: List[Order] = order_list
        self.num_vehicle = len(vehicle_list)
        self.num_order = len(order_list)
        self.coords = [depot_coord]
        self.coords += [order.coord for order in order_list]
        self.coords = np.asanyarray(self.coords, dtype=float)
        if distance_matrix is not None:
            self.distance_matrix = np.asanyarray(distance_matrix,dtype=float)
        else:
            #self.distance_matrix = get_real_distance_matrix(self.coords)
            self.distance_matrix = haversine_distances(np.radians(self.coords)).astype(float) * 6371000/1000 #earth's radius in KM
        self.velocity = velocity
        self.driving_duration_matrix = self.distance_matrix/velocity
        self.weight_cost_list: List[float] = [0]*self.num_vehicle
        self.distance_cost_list: List[float] = [0]*self.num_vehicle

        self.max_duration = max_duration
    """
        reset the objects to its initial state,
        or to the state of a solution
    """
    def reset(self, solution:Optional[Solution]=None):
        if solution is None:
            self.weight_cost_list: List[float] = [0]*self.num_vehicle
            self.distance_cost_list: List[float] = [0]*self.num_vehicle
            for i, vec in enumerate(self.vehicle_list):
                self.vehicle_list[i].box.reset()
            for i, order in enumerate(self.order_list):
                self.order_list[i].reset()
            return
            
        for i, order in enumerate(self.order_list):
            self.order_list[i].reset(solution.packing_position_list[i], solution.insertion_order_list[i], solution.rotate_count_list[i])
        
        for i, vec in enumerate(self.vehicle_list):
            packed_items = [self.order_list[oi].packed_item_list for oi in solution.tour_list[i]]
            packed_items = list(chain.from_iterable(packed_items))
            self.vehicle_list[i].box.reset(packed_items, solution.ep_list[i])

            self.weight_cost_list[i] = self.vehicle_list[i].compute_weight_cost()
            tour_list_length = compute_tour_list_length(self.distance_matrix, solution.tour_list)
            self.distance_cost_list = [tour_list_length[i]*self.vehicle_list[i].cost_per_km for i in range(self.num_vehicle)]
        
    def to_dict(self):
        return {
            "product_type": [_.to_dict() for _ in self.product_types],
            "vehicle_list": [_.to_dict() for _ in self.vehicle_list],
            "order_list" : [_.to_dict() for _ in self.order_list],
            "cardboard_list" : [_.to_dict() for _ in self.cardboard_list],
            "depot_coord" : self.coords[0].tolist(),
            "max_duration" : self.max_duration,
            "distance_matrix" : self.distance_matrix.tolist()
            }
    
    @classmethod
    def from_dict(cls, data):
        """Reconstruct the object from a dictionary."""
        product_types = [Medicine.from_dict(_) for _ in data["product_type"]]

        return cls(
            product_types = product_types,
            vehicle_list = [Vehicle.from_dict(_) for _ in data["vehicle_list"]],
            order_list = [Order.from_dict(_, product_types) for _ in data["order_list"]],
            cardboard_list = [Cardboard.from_dict(_) for _ in data["cardboard_list"]],
            depot_coord = data["depot_coord"],
            max_duration = data["max_duration"],
            distance_matrix = np.array(data["distance_matrix"])
        )