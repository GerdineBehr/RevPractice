
function basicCalculator( x , y , op){
   
    if(/^[^+\-*\/]$/.test(op)){
   
    return null;

    } else {
    const equation = `${x} + ${op} + ${y}`;
    return eval(equation);

    }
}

const x = 3 ;
const y = 3 ;
const op = '8' ;

const solution = basicCalculator( x , y , op) ;

console.log(solution);
