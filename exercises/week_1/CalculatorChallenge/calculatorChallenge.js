
function basicCalculator( x , y , op){
   
    if(/^[^+\-*\/]$/.test(op)){ //regex to see if op == to + - x / 

        //I needed to use \ after + * and / because they have other uses  (as meta characters) in javascript so I needed to escape them 
   
    return null;

    } else {
    const equation = `${x} + ${op} + ${y}`;
    return eval(equation);

    }
}

//test
const x = 3 ;
const y = 3 ;
const op = '8' ;

const solution = basicCalculator( x , y , op) ;
console.log(solution);
