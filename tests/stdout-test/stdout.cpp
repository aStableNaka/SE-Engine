#include <iostream>
#include <string>

/*
Testing possible communication pipelines between
child processes
*/
int main(){
	bool run = true;
	std::cout << "listening for commands";
	std::string data;
	while(run){
		std::getline( std::cin, data );
		if( data == "stop" ){
			std::cout << "Stopping...";
			run = false;
		}else{
			// Echo the data
			std::cout << "Echo: " << data;
		}
	}
	return 0;
}

/*
// Testing within test.js
const child_process = require('child_process');
let child = child_process.spawn( './stdout-test' );

child.stdout.on( 'data', console.log );

// Writing data to a child
function tell( childProcess, data ){
	childProcess.stdin.write( `${data}\n` );
}

tell( child, 'echo this') // child Sends 'Echi: echo this' to stdout
tell( child, 'stop' ); // Kills the child's listening loop
*/