
export default  class SMLComponent {

    render() {
        throw new Error('Render Method Must be defined!')
    }

    m(stringsArr, ...values) { 
        const placeHolders = [];
        let htmlString = ``;
        // Recombine html string parts
        stringsArr.forEach((str, i) => {
          htmlString += str;
          const value = values[i];
          if (value && typeof value === "string") {
            htmlString += value;
          } else if (value) {
            placeHolders.push({ index: htmlString.length, value });
          }
        });
       return { htmlString, placeHolders };
      }
}
