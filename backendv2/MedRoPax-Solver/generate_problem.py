from random import seed
import datetime

import numpy as np
import random
import json

import sys
from uuid import uuid4

from vrp3d.vrp3d import VRP3D

from vehicle.vehicle import Vehicle, create_vehicle

from order.order import Order
from item.medicine import Medicine
from item.cardboard import Cardboard


from faker import Faker
from faker.providers import BaseProvider
import random


class UniqueNameProvider(BaseProvider):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.generated_names = set()

    def _generate_unique_name(self, parts):
        while True:
            name = "".join(random.choice(part) for part in parts)
            if name not in self.generated_names:
                self.generated_names.add(name)
                return name

    def medicine_name(self):
        prefixes = ["Neo", "Max", "Ultra", "Bio", "Med", "Thera"]
        roots = ["cillin", "profen", "mab", "vir", "lol", "statin"]
        suffixes = ["RX", "Plus", "XL", "XR", "OD", "EZ"]
        return self._generate_unique_name([prefixes, roots, suffixes])

    def vehicle_name(self):
        brands = ["Haul", "Titan", "Mega", "Power", "Iron", "Trail"]
        models = ["T", "X", "Z", "R", "Pro", "Elite"]
        capacities = ["3500", "4500", "5500", "HD", "Max", "XL"]
        return self._generate_unique_name([brands, models, capacities])

    def cardboard_box_name(self):
        materials = ["Corr", "Eco", "Hard", "Flex", "Pack"]
        sizes = ["Small", "Medium", "Large", "XL", "XXL"]
        codes = ["A1", "B2", "C3", "D4", "E5"]
        return self._generate_unique_name([materials, sizes, codes])

    def customer_name(self):
        titles = ["Mr.", "Ms.", "Dr.", "Mrs.", ""]
        first_names = ["John", "Jane", "Alex", "Emily", "Chris",
                       "Sarah", "Michael", "Laura", "David", "Emma"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones",
                      "Miller", "Davis", "Garcia", "Martinez", "Hernandez"]
        return self._generate_unique_name([titles, first_names, last_names])


fake = Faker()
unique_provider = UniqueNameProvider(fake)
fake.add_provider(unique_provider)


def generate_product_types() -> list[Medicine]:
    product_types = []
    for _ in range(10):
        id_ = uuid4().int
        weight = np.random.uniform(1, 10)
        length = np.random.uniform(1, 10)
        width = np.random.uniform(1, 10)
        height = np.random.uniform(1, 10)
        size = np.array([length, width, height])
        need_refrigeration = np.random.uniform(0, 1) > 0.5
        is_fragile = np.random.uniform(0, 1) > 0.5
        name_ = fake.medicine_name()
        product_types += [Medicine(id_, weight, size,
                                   need_refrigeration, is_fragile, name_)]

    return product_types


def generate_orders(product_types: list[Medicine]) -> list[Order]:
    orders = []

    for _ in range(10):
        ordered_products = []
        for __ in range(10):
            ordered_products += [random.choice(product_types)]
        id_ = uuid4().int
        coords = (np.random.uniform(-6.1, -6.3),
                  np.random.uniform(106.7, 106.9))
        name_ = fake.customer_name()

        orders += [Order(id_, name_, ordered_products, coords)]

    return orders


def generate_vehicles(max_duration) -> list[Vehicle]:
    vehicles = []
    for _ in range(10):
        max_weight = np.random.uniform(1, 10)
        length = np.random.uniform(10000, 100000)
        width = np.random.uniform(10000, 100000)
        height = np.random.uniform(10000, 100000)
        size = np.array([length, width, height])
        cost_per_km = np.random.uniform(10, 100)
        cost_per_kg = np.random.uniform(10, 100)
        is_reefer = np.random.uniform(0, 1) > 0.5
        vehicle_type = fake.vehicle_name()
        id_ = uuid4().int

        vehicles += [create_vehicle(size, max_weight, cost_per_km,
                                    cost_per_kg, is_reefer, max_duration, vehicle_type, id_)]

    return vehicles


def generate_cardboard_boxes() -> list[Cardboard]:
    cardboard_boxes = []
    for _ in range(100):
        id_ = uuid4().int
        name_ = fake.cardboard_box_name()
        max_weight = np.random.uniform(1, 10)
        length = np.random.uniform(1000, 10000)
        width = np.random.uniform(1000, 10000)
        height = np.random.uniform(1000, 10000)
        size = np.array([length, width, height])

        cardboard_boxes += [Cardboard(id_, size, max_weight, name=name_)]

    return cardboard_boxes


def serialize_to_file(obj, file_path):
    with open(file_path, "w") as file:
        json.dump(obj.to_dict(), file)


def deserialize_from_file(cls, file_path):
    with open(file_path, "r") as file:
        data = json.load(file)
    return cls.from_dict(data)


def run():
    max_duration = 10000000000000.0

    product_types = generate_product_types()
    order_list = generate_orders(product_types)
    cardboard_list = generate_cardboard_boxes()
    vehicle_list = generate_vehicles(max_duration)

    depot_coord = (np.random.uniform(-6.1, -6.3),
                   np.random.uniform(106.7, 106.9))

    problem = VRP3D(product_types,
                    vehicle_list,
                    order_list,
                    cardboard_list,
                    depot_coord,
                    max_duration)
    serialize_to_file(problem, sys.argv[1])


if __name__ == "__main__":
    seed(datetime.datetime.now().timestamp())
    run()
