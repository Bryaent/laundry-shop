function showPage(pageId) {
  // Alisin ang 'active' sa lahat ng sections
  document.querySelectorAll('kontainer').forEach(sec => sec.classList.remove('active'));
  
  // Idagdag ang 'active' class sa piniling section
  document.getElementById(pageId).classList.add('active');
}
