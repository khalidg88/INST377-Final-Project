document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const randomBtn = document.getElementById('random-btn');
    const resultsContainer = document.getElementById('results-container');
    const API_KEY = 'AIzaSyByMC46L0Zl3jz8VXk7EHYwHY7hfOEcx2Y'; 
    
    
    searchBtn.addEventListener('click', searchBooks);
    randomBtn.addEventListener('click', getRandomBookWithQuote);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchBooks();
    });
    
    
    async function searchBooks() {
        const query = searchInput.value.trim();
        if (!query) {
            alert('Please enter a search term');
            return;
        }
        
        showLoading();
        
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&key=${API_KEY}`);
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const data = await response.json();
            displayResults(data.items || []);
        } catch (error) {
            showError('Error fetching books', error);
        }
    }
    
    
    async function getRandomBookWithQuote() {
        const randomSubjects = [
            'fiction', 'science', 'history', 'biography', 
            'philosophy', 'literature', 'poetry'
        ];
        const randomSubject = randomSubjects[Math.floor(Math.random() * randomSubjects.length)];
        
        showLoading('Finding a random book with quotes...');
        
        try {
           
            const searchResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${randomSubject}&filter=partial&maxResults=40&key=${API_KEY}`);
            if (!searchResponse.ok) throw new Error(`Search failed with status ${searchResponse.status}`);
            
            const searchData = await searchResponse.json();
            if (!searchData.items || searchData.items.length === 0) {
                throw new Error('No books found in this category');
            }
            
         
            const booksWithText = searchData.items.filter(book => 
                book.searchInfo?.textSnippet || 
                book.volumeInfo?.previewLink
            );
            
            if (booksWithText.length === 0) {
                throw new Error('No books with preview text available');
            }
            
           
            const randomBook = booksWithText[Math.floor(Math.random() * booksWithText.length)];

            let quoteText = '';
            
           
            if (randomBook.searchInfo?.textSnippet) {
                quoteText = cleanTextSnippet(randomBook.searchInfo.textSnippet);
            }

            if (!isMeaningfulQuote(quoteText) && randomBook.volumeInfo?.description) {
                quoteText = extractQuoteFromText(randomBook.volumeInfo.description);
            }

            if (!isMeaningfulQuote(quoteText)) {
                quoteText = "A meaningful quote couldn't be extracted, but here's a great book!";
            }
      
            const bookWithQuote = {
                ...randomBook,
                extractedQuote: quoteText
            };
            
            displayResults([bookWithQuote], true);
            
        } catch (error) {
            showError('Error fetching random book with quote', error);
        }
    }

    function displayResults(books, showQuote = false) {
        if (!books || books.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No books found</h3>
                    <p>Try a different search term or check back later.</p>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = '';
        
        books.forEach(book => {
            if (!book.volumeInfo) return;
            
            const bookCard = document.createElement('div');
            bookCard.className = 'quote-card';
            
            const volumeInfo = book.volumeInfo;
            const title = volumeInfo.title || 'Untitled';
            const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown author';
            const description = volumeInfo.description || 'No description available';
            const thumbnail = volumeInfo.imageLinks ? 
                volumeInfo.imageLinks.thumbnail.replace('http://', 'https://') : 
                'https://via.placeholder.com/120x180?text=No+Cover';
            

            const displayText = showQuote && book.extractedQuote ? 
                `<div class="quote-section">
                    <p class="quote-text">"${book.extractedQuote}"</p>
                    <p class="quote-source">— From <em>${title}</em></p>
                </div>` : 
                `<p class="book-description">${truncateDescription(description)}</p>`;
            
            bookCard.innerHTML = `
                <img src="${thumbnail}" alt="${title}" class="book-cover" onerror="this.src='https://via.placeholder.com/120x180?text=No+Cover'">
                <div class="quote-content">
                    <h3 class="book-title">${title}</h3>
                    <p class="book-author">By ${authors}</p>
                    ${displayText}
                    ${volumeInfo.publishedDate ? `<p class="book-year">Published: ${volumeInfo.publishedDate.substring(0, 4)}</p>` : ''}
                    ${volumeInfo.categories ? `
                        <div class="book-categories">
                            ${volumeInfo.categories.slice(0, 3).map(cat => `<span class="tag">${cat}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${volumeInfo.infoLink ? `<a href="${volumeInfo.infoLink}" target="_blank" class="book-link">View on Google Books</a>` : ''}
                </div>
            `;
            
            resultsContainer.appendChild(bookCard);
        });
    }

    function cleanTextSnippet(snippet) {

        return snippet.replace(/<[^>]*>?/gm, '')
                     .replace(/\s+/g, ' ')
                     .trim();
    }
    
    function isMeaningfulQuote(text) {
        if (!text) return false;

        return text.length > 30 && 
               text.length < 500 && 
               !text.includes('...') && 
               text.split(' ').length > 5;
    }
    
    function extractQuoteFromText(text) {

        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length === 0) return truncateDescription(text, 150);
        

        const meaningfulSentences = sentences.filter(s => s.length > 30 && s.length < 200);
        if (meaningfulSentences.length > 0) {
            return meaningfulSentences.reduce((longest, current) => 
                current.length > longest.length ? current : longest
            ).trim();
        }

        return sentences[0].trim();
    }
    
    function truncateDescription(text, maxLength = 200) {
        if (!text) return 'No description available';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    function showLoading(message = 'Searching...') {
        resultsContainer.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> ${message}</div>`;
        resultsContainer.style.display = 'flex';
    }
    
    function showError(title, error) {
        console.error(`${title}:`, error);
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>${title}</h3>
                <p>${error.message}</p>
                <p>Please try again later.</p>
            </div>
        `;
    }
});

function setupNavigation() {

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-right a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-right a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (currentPage === linkPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setActiveNavLink();
    
    // Your existing code...
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const randomBtn = document.getElementById('random-btn');
    const resultsContainer = document.getElementById('results-container');

});

document.addEventListener('DOMContentLoaded', setupNavigation);