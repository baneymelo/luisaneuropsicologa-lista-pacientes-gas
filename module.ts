namespace Module {
    export const getInputSheet: Sheet = (id, sheetName) => {
               const ss: SpreadsheetApp = SpreadsheetApp.openById(id);
               const inputSheet: Sheet = ss.getSheetByName(sheetName);
               return inputSheet;
   }

   const filterIds = [1,2,5,8]
   const filterByIndex = (array, index) => filterIds.includes(index);

   export const filterByCells = (inputValues: String[]) => {
       return inputValues.reduce((acc, cur, row) => {
           const filteredValues = cur.filter(filterByIndex);
           acc.push(filteredValues);
           return acc;
       },[]);
   }

   const patientHasSession = (inputValue: String[]) => inputValue[1] !== "" && inputValue[8] !== 1

   export const sanitizeByEmptyNameAndSession = (inputValues: String[]) => (
       inputValues.filter(inputValue => !patientHasSession(inputValue))
   )

   const createPatient = (patientsArrayData) => ({
           document: patientsArrayData[1],
           name: patientsArrayData[0],
           date: [patientsArrayData[2]],
           session: patientsArrayData[3]
   })

   export const arrayToPatients = (patientsArray) => {
       console.log(patientsArray)
          return patientsArray.reduce((patient, currPatient) => {
          if(currPatient[0][0] === ''){
            return;
          }
          return patient;
       },[])
      /* return patientsArray.reduce((patient, currPatient) => {
          const DOCUMENT = currPatient[1];
              if (patient[DOCUMENT]) {
                  patient[DOCUMENT].date.push(currPatient[2]);
                  patient[DOCUMENT].session++;
              } else {
                  patient[DOCUMENT] = createPatient(currPatient);
              }
          return patient;
      }, {}) */
  }

  export const createDocument = (name: String) => DocumentApp.create(name)
    .getBody()
    .appendParagraph(name.toUpperCase())
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  export const createTable = (data: {}) => {

  }
}
