import { config } from "@config";

export type TickProfileSample = {
    p: number, // portion of this tick's time cost compared to siblings
    a: number, // Average tick time cost, in MS
    s: number, // total time cost of the current histroy, in ms
    c: TickProfileSample[]
}

/**
 * The tickprofiler is a tree structure that logs the execution times
 * of ticks
 */
export class TickProfiler{
    
    /**
     * Different structures that hold references to the same object
     * in case i need them (?)
     */
    static map: Map<string, TickProfiler> = new Map();
    static root: TickProfiler[] = [];

    /**
     * Only keep a limited number of time samples
     */
    static historyLen: number = config.tick.ps;

    label: string = "";
    chain: string = "";
    children: TickProfiler[] = [];
    parent?:TickProfiler;

    tStart: number = 0;
    history: number[] = [0];     // Wrap insert
    index: number = 0;
    
    constructor(label:string="UNKNOWN", parent?:TickProfiler){
        this.label = label;
        TickProfiler.map.set( this.labelChain, this );
        if(parent){
            parent.appendChild( this );
        }else{
            TickProfiler.root.push( this );
        }
    }

    get last(): number{
        return this.history[ (this.index || 1 - 1 ) % TickProfiler.historyLen ];
    }

    /**
     * Descends the tree to get a label chain
     */
    get labelChain(): string{
        if(this.chain!=""){
            return this.chain;
        }
        else if(this.parent){
            const lc = `${this.parent.labelChain}.${this.label}`;
            this.chain = lc;
            return lc;
        }else{
            const lc = `root.${this.label}` 
            this.chain = lc;
            return lc;
        }
    }

    /**
     * Start the timer
     */
    start(){
        // Only allow profiler to log if it is enabled in the config
        if(!(config.debug.enable && config.debug.tools.profiler)){
            return;
        }
        this.tStart = new Date().getTime();
    }

    /**
     * End the timer and add the delta to the history.
     * The history is a fixed length array that contains
     * a list of n previous time samples.
     * old samples will be overwritten with new samples.
     */
    end(){
        // Only allow profiler to log if it is enabled in the config
        if(!(config.debug.enable && config.debug.tools.profiler)){
            return;
        }
        
        this.history[ this.index % TickProfiler.historyLen ] = new Date().getTime() - this.tStart;
        this.index++;
    }

    /**
     * Depth-First traversal
     * 
     * Create a
     * @returns 
     */
    sample(  ):TickProfileSample{
        const self = this;
        const histSum = this.history.reduce((a,b)=>{return a + b});

        let childrenTCAvgSum = 0; // Children Time-Cost-Average Sum

        // No children? No problem.

        const childSamples = self.children.map(( child )=>{
            const cSample = child.sample();
            childrenTCAvgSum+=cSample.a;
            return cSample;
        });

        childSamples.map( ( cs )=>{
            cs.p = cs.a / childrenTCAvgSum
        })

        const sample = {
            p: 0,
            a: self.history.reduce((a,b)=>{return a + b}) / this.history.length, 
            s: histSum,
            c: childSamples,
        }

        return sample;
    }

    // Add a child to this tick profiler.
    appendChild( child: TickProfiler ){
        this.children.push(child);
    }
}