import pm4py
import ebi

PMF_DIR = "/Users/bojack/Documents/Projects/Assignments/PMF"


def log_to_spolang(xes_path, spolang_path, num_traces=1000, tree_path=None):
    """Event log (.xes) -> finite stochastic partially ordered language (.spolang).

    Chain (each step verified against the Ebi manual):
      1. pm4py inductive miner               -> control-flow process tree
      2. ebi discover occurrence sbpmn       -> stochastic BPMN; the only model
                                                type whose partially-ordered
                                                semantics step 3 accepts
      3. ebi sample partially-ordered-traces  -> .spolang (the ONLY command that
                                                 emits a .spolang)
    """
    log = pm4py.read_xes(xes_path, return_legacy_log_object=True)
    tree = pm4py.discover_process_tree_inductive(log)

    if tree_path:
        pm4py.write_ptml(tree, tree_path)
        print(f"wrote {tree_path}")
    
    #    Weight each sequence flow by the occurrences of its label -> stochastic
    #    BPMN. Ebi returns it as a string (only logs/Petri nets/process trees/
    #    numbers are returned as PM4Py objects; everything else is a string).

    # 4. Sample partially ordered traces -> .spolang content (also a string).
    spolang = ebi.sample_partially_ordered_traces(f"{PMF_DIR}/discover_occurrence_stochastic_business_process_model_and_notation.sbpmn", num_traces)

    with open(spolang_path, "w") as f:
        f.write(spolang)
    print(f"wrote {spolang_path}")
    return spolang

if __name__ == "__main__":
    # Original event log
    log_to_spolang(
        f"{PMF_DIR}/LL_original.xes",
        f"{PMF_DIR}/LL_original.spolang",
        tree_path=f"{PMF_DIR}/LL_original.ptml",
    )