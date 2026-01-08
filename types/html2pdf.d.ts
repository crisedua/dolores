declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | [number, number] | [number, number, number, number];
        filename?: string;
        image?: {
            type?: 'jpeg' | 'png' | 'webp';
            quality?: number;
        };
        html2canvas?: {
            scale?: number;
            logging?: boolean;
            useCORS?: boolean;
            backgroundColor?: string;
            windowWidth?: number;
            [key: string]: any;
        };
        jsPDF?: {
            unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc';
            format?: 'a4' | 'letter' | 'legal' | [number, number];
            orientation?: 'portrait' | 'landscape';
            [key: string]: any;
        };
        [key: string]: any;
    }

    interface Html2Pdf {
        set(options: Html2PdfOptions): Html2Pdf;
        from(element: HTMLElement | string): Html2Pdf;
        save(): Promise<void>;
        output(type: string, options?: any): Promise<any>;
        then(callback: (pdf: any) => void): Promise<any>;
    }

    function html2pdf(): Html2Pdf;

    export default html2pdf;
}

declare module 'html2pdf.js/dist/html2pdf.bundle.min.js' {
    import html2pdf from 'html2pdf.js';
    export default html2pdf;
}

declare module 'html2canvas-pro' {
    interface Html2CanvasOptions {
        scale?: number;
        logging?: boolean;
        useCORS?: boolean;
        backgroundColor?: string;
        windowWidth?: number;
        [key: string]: any;
    }
    export default function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
}
