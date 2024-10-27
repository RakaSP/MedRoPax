
import numpy as np
import json

from item.box import Box
from item.cardboard import Cardboard
from item.medicine import Medicine
from item.item import Item


from vehicle.vehicle import create_vehicle
from order.order import Order

#takes in a vehicle.box that contains box and medicine
def vehiclebox_to_dict(vehicle_box):
    vehicle_box_dict = {}
    vehicle_box_dict["Type"] = "VehicleContainer"
    vehicle_box_dict["ID"] = vehicle_box.id
    vehicle_box_dict["SizeX"] = vehicle_box.size[0]
    vehicle_box_dict["SizeY"] = vehicle_box.size[1]
    vehicle_box_dict["SizeZ"] = vehicle_box.size[2]
    vehicle_box_dict["MaxWeight"] = vehicle_box.max_weight
    vehicle_box_dict["ItemList"] = []
    for insertion_order, item in enumerate(vehicle_box.packed_items):
        if isinstance(item, Box):
            vehicle_box_dict["ItemList"] += [container_to_dict(item)]

        elif isinstance(item, Item):
            vehicle_box_dict["ItemList"] += [item_to_dict(item)]

    return vehicle_box_dict


#takes in a box that contains medicines
def container_to_dict(container):
    container_dict = {}
    container_dict["Type"] = "Container"
    container_dict["ID"] = container.id
    container_dict["SizeX"] = container.size[0]
    container_dict["SizeY"] = container.size[1]
    container_dict["SizeZ"] = container.size[2]
    container_dict["MaxWeight"] = container.max_weight
    container_dict["PosX"] = container.position[0]
    container_dict["PosY"] = container.position[1]
    container_dict["PosZ"] = container.position[2]
    container_dict["OrderID"] = container.packed_items[0].order_id
    container_dict["ItemList"] = []
    for insertion_order, item in enumerate(container.packed_items):
        container_dict["ItemList"] += [item_to_dict(item)]
    
    return container_dict
    
#takes in a medicine
def item_to_dict(item):
    item_dict = {}
    item_dict["Type"] = "Item"
    item_dict["ID"] = item.id
    item_dict["SizeX"] = item.size[0]
    item_dict["SizeY"] = item.size[1]
    item_dict["SizeZ"] = item.size[2]
    item_dict["Weight"] = item.weight
    item_dict["PosX"] = item.position[0]
    item_dict["PosY"] = item.position[1]
    item_dict["PosZ"] = item.position[2]
    item_dict["OrderID"] = item.order_id

    return item_dict


def json_to_data(json_path):

    containers = []
    vehicles = [] 
    orders = []

    with open(json_path) as f:
        json_data = json.load(f)

        for instance in json_data:

            if instance["Type"] == "Container":
                size = np.asanyarray([instance["SizeX"], instance["SizeY"], instance["SizeZ"]], dtype=np.int64)
                containers.append(Cardboard(instance["ID"], "CBCode", "CBDetails", size, instance["MaxWeight"]))

            elif instance["Type"] == "Order":
                meds = []
                it = 1
                for med in instance["ItemList"]:
                    size = np.asanyarray([med["SizeX"],med["SizeY"],med["SizeZ"]], dtype=np.int64)
                    medtemp = Medicine(med["ID"], str(instance["ID"]), str(0), str(med["ID"]), it, "grams", size, int(float(med["Weight"])), 0, False)
                    #medtemp = Medicine(med.id, str(db_order.id), str(db_order.relation_id), str(med.id), it, med.UOM, size, int(float(med.weight)), TEMP_CLASS[med.delivery_category], med.is_life_saving)
                    it += 1
                    meds.append(medtemp)
                orders.append(Order(instance["ID"], 0, meds, (0, 0)))
                #orders.append(Order(db_order.id, db_order.relation_id, meds, (db_customer.latitude, db_customer.longitude)))

            elif instance["Type"] == "VehicleContainer":
                vehicles += [create_vehicle("SusunBox", np.asanyarray([instance["SizeX"], instance["SizeY"], instance["SizeZ"]], dtype=np.int64), 
                               instance["MaxWeight"], 1.0, 1.0, 0, 10000000.0, "SusunBoxVehicleType", 1)]
                
    containers = sorted(containers, key=lambda box: box.volume)  
    
    return vehicles, containers, orders
