
export enum VerboseLevel{
	ERROR = 0x1,
	WARNING = 0x2,
	IMPORTANT = 0x4,
	STATUS = 0x8,
	VERBOSE = 0x10,
	VARIABLES = 0x20
}

/**
 * The more we log, the better. 
 */
export class Verboosie{
	vMask: VerboseLevel;

	/**
	 * A vMask of 0xfff
	 * means everything gets logged
	 */
	constructor( vMask: number = 0xfff ){
		this.vMask = vMask;
		this.log( `Verboosie with vMask of ${ vMask } initialized`, `Verboosie#Logger`, );
	}

	static createVMask( vLevels: VerboseLevel[] ){
		return vLevels.reduce( (a,b)=>{
			return a+b;
		});
	}

	/**
	 * Log to console and any other
	 * connected logging stream
	 * 
	 * ERROR = 0x1,
	 * WARNING = 0x2,
	 * IMPORTANT = 0x4,
	 * STATUS = 0x8,
	 * VERBOSE = 0x10,
	 * VARIABLES = 0x20
	 * @param data 
	 * @param identity ClassName#GroupName
	 * @param vLevel 
	 */
	public log( data: any, identity?: string, vLevel: VerboseLevel = 0x10 ){
		if( this.vMask & vLevel ){
			let id = '';
			if( identity ){
				id = `[ ${identity} ]: `;
			}
			console.log( id, data );
		}
	}
}

/**
 * Global Verboosie for general logging
 */
export const Verbose = new Verboosie( Verboosie.createVMask([0xff]) );