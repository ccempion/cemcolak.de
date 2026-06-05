Partially Ordered Stochastic Conformance
Checking

Frederic-Leon Culmsee

RWTH Aachen, frederic.culmsee@rwth-aachen.de

1 Scenario

We use the toy Petri net as the running example throughout this report (Fig-
ure 1) to illustrate the concepts in Leemans et al. [1]. After T 1, the process
splits into two concurrent branches: T 2 and T 3 are independent and may occur
in either order. Both branches must complete before T 4 can ﬁre. From there,
execution either continues to T 6 (termination) or takes T 5, which loops back
and enables another iteration of the same concurrent block.

This simple example already exhibits the two challenges that motivate par-
tially ordered stochastic conformance checking: First, concurrency creates mul-
tiple equivalent interleavings that represent the same partial order. And second,
the loop can be repeated arbitrarily many times leading to an inﬁnite stochastic
language for the model.

P 2

T 2

P 4

P 1

T 1

T 4

P 6

T 6

P 7

P 3

T 3

P 5

T 5

Fig. 1. Example Petri net with concurrency on
executions via T 5.

{

T 2, T 3

}

and a loop enabling repeated

2 Technique

This section summarizes the technique proposed by Leemans et al. [1]. Leemans
et al. introduce a novel approach to stochastic conformance checking (SCC) that

2

Frederic-Leon Culmsee

accounts for concurrency in process models and logs. The technique is based
on the concept of partially ordered traces (PO-traces) and a two-layer distance
calculation using the Earth Movers’ Stochastic Conformance (EMSC) framework
introduced in [3].

2.1 Setting

Leemans et al.’s approach considers conformance checking between an event log
(observed behavior) and a process model (ideal behavior), where both are rep-
resented as stochastic languages over partially ordered traces. Both model and
behavior are interpreted as probability distributions over possible executions.
Conformance is deﬁned as the distance between these distributions, measured us-
ing EMSC. The model is assumed to be a Labeled Stochastic Petri Net (LSPN),
like the one shown in Figure 1.

The technique is only applicable to models with the following properties:

↓

– Safety: A model is safe if no place can contain more than one token (

P : M (p)

1). This simpliﬁes the computation of run probabilities.

p

→

↑

– Sound: Models are sound if they can always reach a proper completion state,
that is, a state in which only the designated end place (P7 in our scenario)
holds a token and no transitions are enabled. This guarantees that runs
don’t get stuck in deadlocks, which would cause leakage of probability mass,
making the stochastic language ill-deﬁned.

– Confusion-freeness: If two transitions share an input place but do not share
all input places, they cannot be jointly enabled in any reachable marking.
This guarantees that concurrent transitions are independent and allows us
to disregard their execution order when computing probabilities.

The output of the technique is a distance value that quantiﬁes how well model
and log conform.

2.2 Partial-Order Traces and Their Linearizations

Each run of an LSPN corresponds to a total-order trace (TO-trace) that lists the
sequence of transition ﬁrings. However, when transitions are concurrent, multi-
ple TO-traces can represent the same underlying behavior. To capture this, the
technique uses partially ordered traces (PO-traces), which allow for sets of con-
current events to be represented without committing to a speciﬁc order. For
example, in our scenario, transitions T 2 and T 3 are concurrent, so the PO-trace
T 2, T 3
T 1,
and
represents both total-order traces
↔
T 1, T 3, T 2, T 4, T 6
. More generally, the set of total-order traces consistent with
↔
a PO-trace ω is its set of linearizations, denoted lin(ω). To model stochastic be-
havior, probabilities are assigned directly to PO-traces. Formally, a stochastic
PO-language is a function L :
is the
set of PO-traces. This gives a probability distribution over partially ordered be-
havior, which is the input representation used in the conformance metric of the
technique.

T 1, T 2, T 3, T 4, T 6

L(ω) = 1, where

, T 4, T 6
↗

[0, 1] with

P↘

!

→P

P

{

}

↗

↔

↗

ω

Partially Ordered Stochastic Conformance Checking

3

2.3 Two-Layer Distance Calculation

Leemans et al.’s conformance score over the stochastic languages of the model
and log is computed in two layers. First, the method compares individual ex-
ecutions at the trace level using Levenshtein distance ε(ϑ, ϑ↑). Second, it then
compares the full stochastic behavior at the language level by aggregating these
trace-level di!erences with probability weights using Earth Movers’ Stochastic
Conformance (EMSC) [3]. Colloquially, the Levenshtein distance expresses how
di!erent two traces are and the EMSC distance expresses how probability mass
is distributed across these di!erences.

Per-Trace Distance: Levenshtein Distance At the trace level, the method
compares two total-order traces ϑ and ϑ↑ using the Levenshtein distance ε(ϑ, ϑ↑):
the minimum number of insertions, deletions, and substitutions needed to trans-
form one trace into the other. This distance can be interpreted in terms of align-
ment moves: a synchronous move (matching events e = e↑) has a cost of 0, while
log-only or model-only moves (insertions/deletions, e
= e↑) and substitutions
each have a cost of 1.

EMSC Distance over Stochastic Languages At the language level, Earth
Movers’ Stochastic Conformance (EMSC) compares two stochastic languages L
and L↑, by determining how much probability mass must be moved between
them to transform one into the other. This probability mass is weighted by the
trace level distance. Here, ω and ω↑ denote PO-traces (elements of
), while ϑ
and ϑ↑ denote total-order traces (linearizations).

P

The paper di!erentiates two variants of EMSC with respect to assumptions
about the log’s concurrency. In both cases, the model is assumed to be certain:

– Certain concurrency (EMSC-CC) assumes that all linearizations of each
of the models PO-traces are truly concurrent. The distance therefore is de-
ﬁned as the best case (minimum) trace distance over all linearization pairs.

ϖCC(ω, ω↑) = min

lin(ω)
lin(ω→)

ε
ε→

→
→

ε(ϑ, ϑ↑)

Given this PO-trace distance, the language-level EMSC-CC distance/conformance
score is computed as:

EMSCCC(L, L↑, f ) =

f (ω, ω↑)

·

ϖCC(ω, ω↑)

L
"ω
→
L→
ω→
→

, where f (ω, ω↑) denotes the amount of probability mass moved from ω to ω↑.
– Uncertain concurrency (EMSC-UC) assumes the log’s concurrency stems
from uncertain observations as opposed to being truly concurrent. Many lin-
earizations of its PO-traces are possible, but only one actually occurred.

≃
4

Frederic-Leon Culmsee

Therefore, conformance is deﬁned as a range between the best case (mini-
mum) and worst case (maximum) trace distance over all linearization pairs:

ϖU C worst(ω, ω↑) = max
lin(ω)

min
lin(ω→)
→
ϖU C best(ω, ω↑) = ϖCC(ω, ω↑)

ε→

→

ε

ε(ϑ, ϑ↑)

Let f (ω, ω↑) again denote the transported probability mass from ω to ω↑:

EMSCU C worst(L, L↑, f ) =

f (ω, ω↑)

L
"ω
→
L→
ω→
→

EMSCU C best(L, L↑, f ) =

f (ω, ω↑)

L
"ω
→
L→
ω→
→

ϖU C worst(ω, ω↑)

ϖU C best(ω, ω↑)

·

·

Inﬁnite Behavior, Truncation, and Bounds Models with loops, such as our
example in Figure 1, have inﬁnite stochastic languages, so it is not feasible to
compute the exact EMSC over all PO-traces. The method therefore truncates
the model language to its top-q most probable PO-traces as well as r random
PO-traces. This ensures our distance metrics are well deﬁned and computable.
Let ˜L↑ denote this truncated model language. The omitted probability mass is
tracked as

) = 1

L↑(

⇐

⇒

L↑(ω).

˜L→
"ω
→

This truncation introduces bounds to EMSCCC and widens the range of the
existing bounds of EMSCU C. With higher q and r, more of the model’s behavior
is captured, leading to narrower bounds. In the limit q, r
, the bounds
converge to the conformance value of the full (untruncated) language.

↘ ⇑

3 Advantages & Disadvantages

3.1 Advantages

Compact representation. One PO-trace can represent many total-order
, T 4, T 6
traces. For example, in our scenario, the PO-trace
↗
represents 2 TO-traces. With each loop iteration, the number of TO-traces
corresponding to a single PO-trace doubles, so with i loop iterations this
compresses 2i TO-traces into a single PO-trace:

T 2, T 3

T 1,

{

}

↔

ωPO =

T 1,

↔

{

T 2, T 3

}

, T 4

, (T 5, T 1,

T 2, T 3

{

}

, T 4)↓

, T 6

↗

2 total-order traces

2i

↑

1 total-order traces

#
This reduces the number of traces to compare at the language level, which
is crucial for scalability.

$%

$%

#

&

&

Partially Ordered Stochastic Conformance Checking

5

Concurrency semantics. PO-traces treat concurrent transitions as un-
ordered, so conformance is not a!ected by arbitrary interleavings (noise).
This is faithful to the behavior of concurrent processes, where the execution
order of concurrent events is irrelevant. In contrast, TO-traces treat di!erent
interleavings as di!erent behavior. In practice, this makes TO-trace-based
approaches sensitive to timestamping noise and other sources of spurious
ordering, while PO-trace-based approaches are less a!ected by such issues.
Loop bounding. Truncation (keeping top-q runs) makes loop-heavy models
computationally tractable while providing formal bounds on the introduced
error. As q and r increase, bounds narrow. This enables a qualiﬁed trade-o!
between precision and computational cost, enabling adjustments based on
requirements for quality and resources.

3.2 Disadvantages

Computational Bottleneck. The approach reduces interleaving blow-up
at the language level, but distance computation between PO-traces remains
costly. For each PO-trace pair, the technique may have to reason over many
possible linearizations, whose number grows with the number of concur-
rent events. The paper identiﬁes distance computation, rather than the ﬁnal
transport optimization, as the main bottleneck.
Restrictive Assumptions. The method assumes labeled stochastic Petri
nets that are confusion-free, safe, and sound. These assumptions make the
run generation and probability calculation tractable, but they restrict the
class of admissible input models. The implementation also assumes these
properties instead of automatically verifying them, so violations may lead to
unreliable results rather than explicit errors.
Inexactness due to Truncation. For uncertain log orderings (EMSC-
UC) and/or truncated model behavior, the method returns lower and upper
bounds rather than a single exact value. These bounds are useful because
they make approximation error explicit, but they may become wide when
much probability mass is truncated or when uncertain linearizations di!er
strongly. In such cases the result can indicate limited precision even though
the computation itself succeeds.

4 Positioning

This section positions the PO-trace approach of [1] against two related meth-
ods, Enjoy the Silence [2] and Abstract-and-Compare [4]. The core distinction is
what each method preserves most strongly. Enjoy the Silence emphasizes exact
probability analysis with silent transitions, PO-traces emphasize explicit concur-
rency semantics, and Abstract-and-Compare emphasizes robustness and scala-
bility through abstraction.

6

Frederic-Leon Culmsee

4.1 Enjoy the Silence: Analysis of Stochastic Petri Nets with Silent

Transitions

Paper: Leemans, Maggi, Montali [2].

A main contribution of Enjoy the Silence is exact ﬁnite-trace analysis for
stochastic Petri nets with silent transitions. It introduces labeled stochastic pro-
cesses and derives key probabilities through absorbing Markov chain analysis
with automata-based ﬁltering. This is important because silent transitions can
change visible trace probabilities and therefore a!ect conformance scores. Rel-
ative to PO-traces, the method is stronger on probabilistic foundations with
hidden behavior but it does not model the certain-versus-uncertain concurrency
distinction used by EMSC-CC and EMSC-UC. It is therefore the better choice
when silent-transition ﬁdelity is the main requirement, while PO-traces are bet-
ter when the primary requirement is explicit treatment of concurrent behavior.

4.2 Abstract-and-Compare Stochastic Conformance Checking

Paper: Goulart Rocha, Leemans, van der Aalst [4].

Abstract-and-Compare addresses a di!erent bottleneck, namely scalability
and robustness in large or noisy comparisons. Instead of comparing full stochas-
tic languages directly, it maps model and log to an mk abstraction based on
expected subtrace frequencies and computes conformance on that abstraction.
The parameter k sets how much local context is retained. Larger k preserves
more structure but increases computational cost. This strategy smooths partial
mismatches and can improve robustness, but it does not preserve explicit partial-
order semantics. In the running example, uncertain ordering between T 2 and T 3
is represented explicitly in the PO-trace approach by best-case and worst-case
bounds, while Abstract-and-Compare captures the e!ect only indirectly through
subtrace statistics.

Overall, the three approaches deﬁne a clear choice space for stochastic con-
formance checking. Enjoy the Silence is preferable when exact probability treat-
ment of silent transitions is essential. PO-traces are preferable when concur-
rency semantics and EMSC-CC or EMSC-UC interpretation must remain ex-
plicit. Abstract-and-Compare is preferable when scalability and robustness to
partial mismatch are the dominant practical goals.

References

1. Leemans, S.J.J., Brockho!, T., van der Aalst, W.M.P., Polyvyanyy, A.: Partially
ordered stochastic conformance checking. Knowledge and Information Systems 67,
2291–2319 (2025). https://doi.org/10.1007/s10115-024-02280-7

2. Leemans, S.J., Maggi, F.M., Montali, M.: Enjoy the silence: Analysis of
stochastic petri nets with silent transitions. Information Systems 124, 102383
(2024). https://doi.org/https://doi.org/10.1016/j.is.2024.102383, https:
//www.sciencedirect.com/science/article/pii/S0306437924000413

Partially Ordered Stochastic Conformance Checking

7

3. Leemans, S.J., van der Aalst, W.M., Brockho!, T., Polyvyanyy, A.: Stochastic
process mining: Earth movers’ stochastic conformance. Information Systems 102,
101724 (2021). https://doi.org/https://doi.org/10.1016/j.is.2021.101724,
https://www.sciencedirect.com/science/article/pii/S0306437921000041
4. Rocha, E.G., Leemans, S.J.J., van der Aalst, W.M.P.: Abstract-and-compare
stochastic conformance checking. Process Science 2, 13 (2025). https://doi.org/
10.1007/s44311-025-00014-8


