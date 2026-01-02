
import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an Excel file.
 * @param data Array of objects to export.
 * @param fileName Name of the file to save (without extension).
 * @param sheetName Name of the worksheet.
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    // 1. Create a worksheet from the JSON data
    const ws = XLSX.utils.json_to_sheet(data);

    // 2. Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 3. Generate buffer and download
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};
