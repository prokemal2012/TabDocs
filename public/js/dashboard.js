// Function to load the documents and display their previews
async function loadDocuments() {
  const response = await fetch('/get-documents');
  const documents = await response.json();

  const docGrid = document.getElementById('document-grid');

  // Clear the grid before appending new documents
  docGrid.innerHTML = '';

  // Loop through the documents and create preview cards
  documents.forEach(doc => {
    const docCard = document.createElement('div');
    docCard.className = 'document-card';
    docCard.id = `doc-${doc.doc_id}`;  // Use the doc_id as part of the card ID

    // Create the document preview template
    docCard.innerHTML = `
      <a href="/docid?docid=${doc.doc_id}">
        <img src="" alt="Doc Preview" class="doc-preview" id="doc-img-${doc.doc_id}">
        <p>${doc.doc_name || 'Untitled Document'}</p>  <!-- Display only the document name -->
      </a>
    `;

    // Append each document card to the document grid
    docGrid.appendChild(docCard);

    // Update the document preview with the first page image
    updateDocumentPreviewInDashboard(doc.doc_id);
  });
}

// Function to update the document preview image with the first page preview
function updateDocumentPreviewInDashboard(docId) {
  // Retrieve the image URL from localStorage (or fetch from the server in real case)
  const imgURL = localStorage.getItem(`docImage-${docId}`);

  // Find the image element in the document card
  const docImg = document.getElementById(`doc-img-${docId}`);

  // Update the image source with the captured image, fallback to placeholder if image is not found
  if (imgURL && docImg) {
    docImg.src = imgURL;
  } else if (docImg) {
    docImg.src = 'https://via.placeholder.com/150';  // Fallback to placeholder image if no image
  }
}

// Load documents on page load
window.onload = loadDocuments;
