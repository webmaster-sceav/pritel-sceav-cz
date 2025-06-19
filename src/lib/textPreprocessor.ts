export function changeWhitespacetoNbsp( inputText: string ){
    if ( inputText == "" ) return "";
    const prepositionsConjuntions = [ 'k', 's', 'v', 'z', 'o', 'u', 'i', 'a', ];
    let outputText = inputText;

    for ( const char of prepositionsConjuntions ) {
            const regExp = new RegExp( "\\s" + char + "\\s", "gi" );
            outputText = outputText.replace( regExp, ' ' + char + '\xa0' );
    }

    return outputText;
}