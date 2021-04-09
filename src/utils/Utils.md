# Debugging Tools

## TickProfiler

### Description
Provides tools for monitoring arbitrary tick performance by measuring
the time it takes for a tick to execute.

### When to use
Use the TickProfiler to diagnose expensive ticks, ex. when looking for tick routines that
take up a lot of time to execute.

### Performance Impact
Unkown

### Notes
The performance impact of the tick profiler, while calculated to be low,
can increase dramatically and scales linearly with the amount of tick routines
that use it.

## Verboosie

### Description
A tool for logging data with an optional logging priority tag. This
tool acts as a middle-man for console.log with a defined logging
style and log organization.

### When to use
in place of console.log

### Performance impact
low

### Notes

## 