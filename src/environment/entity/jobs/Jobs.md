# Job Attrbiutes
Job.behaviors: Behavior[]
Job.isCompletable: ()=>boolean;
Job.priority: number
Job.actor: EntityActor
Job.persistent: boolean

# Behavior attrbutes
Behavior.isCompletable: ()=>boolean;
Behavior.onComplete: ( callback( Behavior ) )=> void;
Behavior.onInterrupted: ( callback( Behavior ) )=> void;
Behavior.onFail: ( callback( Behavior ) )=> void;
Behavior.actor: EntityActor;

# Jobs

# Job factory
Provides a set of behaviors the entity must perform to accomplish a task ( Job )
Jobs are either persistent or non-persistent.
Persistent jobs get re-queued until completion.
Non-persistent jobs get destroyed on completion or failure.

# Job interruption


# Behavior
Behaviors are individual tasks that build up to a job. Behaviors convey their progress to job objects
through state messages ( or callbacks ). Behaviors must have the following states:
	- Complete
	- Interrupted
	- Fail

Before an entity begins acting on a behavior, the behavior must be determined to be completeable.
If a behavior is not determined to be completeable, the entity must ignore the parent job alltogether.

Calculating the completability for each behavior may take may forms. Each behavior should go about
implementing their completability checks in one of a few ways
	- Network listeners: Determining the completability based on event invokations from networks
	- On-demand calculations: Determining the completability based on information present at the time of the check
Each of these have their advantages and disadvantages and the behavior abstract should have
helpers for setting up each kind of completability check.

Behaviors that interact with networks must queue for resources within that network.
Once the network has sufficient resources for a behavior, it will be the network's job
to mark that behavior as accomplishable.

Networks include:
	- Stockpiles
	- Powergrids



# Behavior States

## Complete
When the complete state is invoked, the job follows up by invoking next behavior task in queue or
invoking a new job for the actor.

## Interrupted
Behaviors, when interrupted, must modify the entity state in such a way that provides a safe starting
point for other behaviors.
#### Example:
BehaviorGoTo: The entity CAN NOT be in the middle of two tiles. Interruptions to BehaviorGoTo must
revert the entity position back to the last tile with a complete traversal.

When a behavior is interrupted, the behavior can either attempt a re-try or invoke a fail state.

## Fail
When a behavior is failed, the parent job gets sent back to the master job list in high priority for
another entity to attempt.