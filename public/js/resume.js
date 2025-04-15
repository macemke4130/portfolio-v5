const handleResumeClick = () => {
  gtag("event", "view_pdf_resume");
};

export const runOnImport = () => {
  $("#pdf-resume").addEventListener("click", handleResumeClick);
  cleanupList.push({ type: "click", variable: handleResumeClick });
};

runOnImport();
