# Challenge 1: Palindrome Checker

**Objective**: Write a function `isPalindrome` that checks if a given string is a palindrome. A palindrome is a word, phrase, number, or other sequences of characters that reads the same forward and backward (ignoring spaces, punctuation, and capitalization).

**Requirements**:

- The function must ignore spaces, punctuation, and capitalization.
- The function should return `true` if the input string is a palindrome and `false` otherwise.

**Example**:

```javascript
isPalindrome("A man a plan a canal Panama"); // should return true
```
function isPalindrome(String){
    //make lowercase

    const lowerCaseString = toLowerCase(String) ;

    //get rid of punctuation and spaces - replace (anything that is not ) with nothing  (AN -Alpha numerical)

    const ANString = lowerCaseString.replace(/[^a-z0-9]/g,'');

    //reverse 

    const ANStringReverse = ANString.split('').reverse().join('')

    //check if they are the same 

    return ANStringReverse == ANString ; 





}