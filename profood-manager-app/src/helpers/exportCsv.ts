/**
 * Minimal, dependency-free CSV export.
 *
 * - RFC-4180 escaping: fields containing a comma, quote or newline are wrapped
 *   in double quotes with internal quotes doubled.
 * - A UTF-8 BOM is prepended on download so Excel (esp. Excel-FR) renders
 *   accented text (Téranga, Xéweul, côte…) correctly instead of mojibake.
 */

type CsvValue = string | number | null | undefined;

const escapeField = (value: CsvValue): string => {
    const s = value === null || value === undefined ? '' : String(value);
    if (/[",\n\r]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

export const toCsv = (headers: string[], rows: CsvValue[][]): string => {
    const lines = [headers.map(escapeField).join(',')];
    for (const row of rows) {
        lines.push(row.map(escapeField).join(','));
    }
    return lines.join('\r\n');
};

export const downloadCsv = (filename: string, csv: string): void => {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
