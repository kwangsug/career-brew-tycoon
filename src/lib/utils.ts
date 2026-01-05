import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNum(num: number): string {
    num = Math.floor(num);
    if (num < 1000) return num.toString();

    const si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "K" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "B" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    
    if (i > 1) { // Use SI for millions and above
        return (num / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
    }

    // For numbers larger than SI prefixes or as a fallback for very large numbers
    const units = ["", "만", "억", "조", "경", "해", "자", "양", "구", "간", "정", "재", "극"];
    if (num < 10000) return num.toLocaleString();
    
    let unitIndex = 0;
    let tempNum = num;
    while(tempNum >= 10000 && unitIndex < units.length -1) {
        tempNum /= 10000;
        unitIndex++;
    }
    
    return `${Math.floor(tempNum).toLocaleString()}${units[unitIndex]}`;
}
