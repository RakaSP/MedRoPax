import sys

import argparse

def prepare_args():
    parser = argparse.ArgumentParser(description='solver arguments')
    
    # args for generating instance based on CVRP problem instances
    parser.add_argument('--instance-filename',
                        type=str,
                        default="problem.json",
                        help="problem instance file name")
    
    parser.add_argument('--result-filename',
                        type=str,
                        default="result.json",
                        help="result filename")
    
    parser.add_argument('--insertion-mode',
                        type=str,
                        default="first-fit",
                        choices=["first-fit","best-fit"],
                        help="how the insertion module select the insertion point given a cargo/item")
    
    parser.add_argument('--construction-mode',
                        type=str,
                        default="wall-building",
                        choices=["wall-building", "layer-building","column-building"],
                        help="construction mode for the insertion/how to order the potential insertion point. \
                            Only necessary when insertion mode is first-fit.")

    parser.add_argument('--min-cardboard-utility',
                        type=float,
                        default=0.8,
                        help="Minimum cardboard box utility threshold (zeta in Algorithm 1)")


    parser.add_argument("--best-config-mode",
                        type=bool,
                        default=False,
                        help="if true, solve with all combinations of parameters and some zeta")

    args = parser.parse_args(sys.argv[1:])
    return args