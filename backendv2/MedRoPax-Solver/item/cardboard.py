import numpy as np

from item.box import Box

class Cardboard(Box):
    def __init__(self, 
                 id:int,
                 size: np.ndarray, 
                 max_weight: int, 
                 support_alpha: float = 0.51, 
                 temperature: int = 0,
                 name = "dummy_cardboard_name"):
        super().__init__(id, size, max_weight, name, support_alpha, temperature)


    def to_dict(self):
        return {
            "id": self.id,
            "size" : self.size.tolist(),
            "max_weight" : self.max_weight,
            "name" : self.name
            }
    
    @classmethod
    def from_dict(cls, data):
        """Reconstruct the object from a dictionary."""
        return cls(
            id = data["id"],
            size = data["size"],
            max_weight = data["max_weight"],
            name = data["name"]
        )