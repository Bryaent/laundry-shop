 function showService(service) {
      // Hide both sections initially
      document.getElementById('fullService').style.display = 'none';
      document.getElementById('selfSelect').style.display = 'none';
      
      // Show the selected section
      document.getElementById(service).style.display = 'block';
    }

    function toggleOption(option) {
      const button = document.getElementById(option);
      if (button.classList.contains('active')) {
        button.classList.remove('active');
      } else {
        button.classList.add('active');
      }
    }