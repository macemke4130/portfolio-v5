const handleResumeClick = () => {
  gtag("event", "view_pdf_resume");
};

$("#pdf-resume").addEventListener("click", handleResumeClick);
cleanupList.push({ type: "click", variable: handleResumeClick });
