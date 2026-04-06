import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';

export const exportToPDF = async (elementId, filename = 'Question_Paper.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    
    // Add new pages if content is long
    let heightLeft = pdfHeight - pdf.internal.pageSize.getHeight();
    while (heightLeft >= 0) {
      position -= pdf.internal.pageSize.getHeight();
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    return false;
  }
};

export const exportToDOCX = async (paperData, filename = 'Question_Paper.docx') => {
  if (!paperData) return false;

  try {
    const children = [];

    // Title
    children.push(
      new Paragraph({
        text: paperData.title || 'Question Paper',
        heading: HeadingLevel.HEADING_1,
        alignment: 'center',
        spacing: { after: 400 },
      })
    );

    // Meta Info (Subject, Duration, Marks)
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Subject: ${paperData.subject || ''}`, bold: true }),
          new TextRun({ text: `\t\t\t\t\tDuration: ${paperData.duration || '3 Hours'}`, bold: true }),
        ],
        spacing: { after: 200 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Total Marks: ${paperData.totalMarks || ''}`, bold: true }),
        ],
        spacing: { after: 400 },
      })
    );
    
    // Sections
    if (paperData.sections && paperData.sections.length > 0) {
      paperData.sections.forEach(section => {
        children.push(
          new Paragraph({
            text: section.sectionTitle || section.name,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          })
        );

        if (section.instructions) {
          children.push(
            new Paragraph({
              text: `Instructions: ${section.instructions}`,
              italics: true,
              spacing: { after: 200 },
            })
          );
        }

        if (section.questions && section.questions.length > 0) {
          section.questions.forEach((q, idx) => {
            const choices = [];
            if (q.question) choices.push(q.question);
            if (q.hasInternalChoice && q.internalChoice?.question) {
              choices.push(q.internalChoice.question);
            }
            if (choices.length === 0 && q.choices) {
              choices.push(...q.choices);
            }

            choices.forEach((choice, cIdx) => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: cIdx === 0 ? `Q${idx + 1}. ` : '      ' }),
                    new TextRun({ text: choice }),
                    ...(cIdx === 0 ? [new TextRun({ text: ` [${q.marks} Marks]`, italics: true })] : [])
                  ],
                  spacing: { after: cIdx === choices.length - 1 ? 160 : 60 },
                })
              );
              
              if (cIdx < choices.length - 1) {
                 children.push(
                  new Paragraph({
                    text: '         --- OR ---',
                    italics: true,
                    spacing: { after: 60 }
                  })
                 );
              }
            });
          });
        }
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error("Error exporting to DOCX:", error);
    return false;
  }
};
