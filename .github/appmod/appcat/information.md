You are implementing the Ralph Loop workflow system for AI-assisted development. Follow this exact process:

## WORKFLOW OVERVIEW:
The Ralph Loop is an iterative development system that prevents context rot by starting fresh sessions for each task. Here's how it works:

## STEP 1: PRD Generation
- Take my initial project idea/prompt (even if mediocre)
- Generate a comprehensive Product Requirements Document (PRD) that includes:
  * Clear description of what we're building
  * Feature breakdown
  * Task list broken down into the smallest possible units
  * Each task should be independent and completable in one session

## STEP 2: Ralph Loop Execution
For each task, follow this loop:

1. **Session Initialization**
   - Start a NEW session (to avoid context rot beyond ~100k tokens)
   - Read the PRD to understand all tasks
   - Check which tasks are marked as "done"
   - Identify the next incomplete task

2. **Task Execution**
   - Focus ONLY on the current task
   - Write code/implementation until task completion
   - If successful: Mark task as "done" in PRD
   - If unsuccessful: Update the progress file (see Step 3)

3. **Progress Tracking** (for failed attempts)
   - Create/update a `progress.md` file that logs:
     * What was attempted (A, B, C approaches)
     * What happened with each attempt
     * What didn't work and why
     * Patterns or insights discovered
     * Suggestions for next iteration

4. **Loop Repeat**
   - Start a NEW session
   - Read PRD for completed tasks
   - Read progress file for failed attempt context
   - Attempt the task again with knowledge of what NOT to do
   - Continue until task succeeds

5. **Next Task**
   - Once a task is complete and marked done
   - Move to the next task
   - Repeat entire process

## KEY PRINCIPLES:
- **One task at a time**: Never try to tackle multiple tasks in one session
- **Fresh sessions**: Start new session for each task attempt to avoid context rot
- **Learn from failures**: Always document failed attempts in progress file
- **Incremental progress**: Small tasks = higher success rate per iteration

## FILE STRUCTURE REQUIRED:
- `PRD.md` - Product Requirements Document with task list and completion status
- `progress.md` - Logs of attempts, failures, and learnings
- `implementation.md` - Technical implementation details and architecture

## YOUR INSTRUCTIONS:
1. First, help me create the PRD from my project idea
2. Then, guide me through executing the Ralph Loop for each task
3. Maintain the PRD and progress files throughout
4. Alert me when starting new sessions to avoid context rot
5. Track completion status and learned patterns

Ready to begin? Please provide your project idea/prompt, and I'll generate the PRD to start the Ralph Loop process.