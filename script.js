// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const isExpanded = navLinks.classList.contains('show');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('show');
                navToggle.setAttribute('aria-expanded', false);
            }
        });

        // Close mobile menu when window is resized above mobile breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('show');
                navToggle.setAttribute('aria-expanded', false);
            }
        });
    }
});

// Modal functionality
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.getElementsByClassName('close')[0];

function showModal(type) {
    modal.style.display = 'block';
    
    if (type === 'maintenance') {
        modalBody.innerHTML = `
            <h2>Report Maintenance Issue</h2>
            <form id="maintenance-form">
                <div class="form-group">
                    <label for="issue-type">Issue Type:</label>
                    <select id="issue-type" required>
                        <option value="">Select type...</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="structural">Structural</option>
                        <option value="common-area">Common Area</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <textarea id="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="location">Location:</label>
                    <input type="text" id="location" required>
                </div>
                <button type="submit">Submit Report</button>
            </form>
        `;
    } else if (type === 'meeting') {
        modalBody.innerHTML = `
            <h2>Schedule Meeting</h2>
            <form id="meeting-form">
                <div class="form-group">
                    <label for="meeting-type">Meeting Type:</label>
                    <select id="meeting-type" required>
                        <option value="">Select type...</option>
                        <option value="committee">Committee Meeting</option>
                        <option value="agm">Annual General Meeting</option>
                        <option value="special">Special General Meeting</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="meeting-date">Date:</label>
                    <input type="datetime-local" id="meeting-date" required>
                </div>
                <div class="form-group">
                    <label for="agenda">Agenda:</label>
                    <textarea id="agenda" required></textarea>
                </div>
                <button type="submit">Schedule Meeting</button>
            </form>
        `;
    }
}

// Close modal when clicking the close button or outside the modal
closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Form submission handling
document.addEventListener('submit', function(e) {
    e.preventDefault();
    if (e.target.id === 'maintenance-form') {
        // Here you would typically send this data to a server
        alert('Maintenance issue reported successfully!');
    } else if (e.target.id === 'meeting-form') {
        // Here you would typically send this data to a server
        alert('Meeting scheduled successfully!');
    }
    modal.style.display = 'none';
});
