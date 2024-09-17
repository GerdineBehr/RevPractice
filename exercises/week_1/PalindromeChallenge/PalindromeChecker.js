
function isPalindrome(Str){
    //make lowercase

    const lowerCaseString = Str.toLowerCase() ;

    //get rid of punctuation and spaces - replace (anything that is not ) with nothing  (AN -Alpha numerical)

    const ANString = lowerCaseString.replace(/[^a-z0-9]/g,''); // g is global(applied to all not just first character)

    //reverse 

    const ANStringReverse = ANString.split('').reverse().join('');

    //check if they are the same 

    return ANStringReverse === ANString ; 


}

//Test 

console.log(isPalindrome("A man a plan a canal Panama"));  // Output: true