export function changeWhitespacetoNbsp(inputText: string){
    if( inputText == "" ) return "";
    const prepositionsConjuntions = ['k', 's', 'v', 'z', 'o', 'u', 'i', 'a'];
    let outputText;
    prepositionsConjuntions.forEach( 
        (element) => {
            const regExp = new RegExp("\\s" + element + "\\s", "g")
            outputText = inputText.replace(regExp, ' ' + element + '\xa0');
        }
    )
    return outputText;
}