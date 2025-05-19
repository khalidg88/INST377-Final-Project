document.addEventListener('DOMContentLoaded', function() {
    const newTopicBtn = document.getElementById('new-topic-btn');
    const newTopicForm = document.getElementById('new-topic-form');
    const topicForm = document.getElementById('topic-form');
    const bookSelect = document.getElementById('topic-book');
    const discussionsList = document.getElementById('discussions-list');
    
    // Toggle new topic form
    newTopicBtn.addEventListener('click', function() {
        newTopicForm.style.display = newTopicForm.style.display === 'none' ? 'block' : 'none';
    });
    

    function loadPopularBooks() {
        const popularBooks = [
            { id: '1', title: 'To Kill a Mockingbird', author: 'Harper Lee' },
            { id: '2', title: '1984', author: 'George Orwell' },
            { id: '3', title: 'Pride and Prejudice', author: 'Jane Austen' },
            { id: '4', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
            { id: '5', title: 'Moby Dick', author: 'Herman Melville' }
        ];
        
        popularBooks.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author}`;
            bookSelect.appendChild(option);
        });
    }
    

    topicForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('topic-title').value;
        const bookId = bookSelect.value;
        const bookText = bookSelect.options[bookSelect.selectedIndex].text;
        const content = document.getElementById('topic-content').value;

        const discussion = document.createElement('div');
        discussion.className = 'discussion';
        discussion.innerHTML = `
            <div class="discussion-header">
                <h3>${title}</h3>
                <span class="discussion-meta">
                    Posted by <strong>You</strong> just now
                </span>
            </div>
            <div class="discussion-content">
                <p>${content}</p>
            </div>
            <div class="discussion-footer">
                <span class="discussion-book">Book: ${bookText}</span>
                <button class="reply-btn"><i class="fas fa-reply"></i> Reply</button>
            </div>
        `;
        
 
        discussionsList.insertBefore(discussion, discussionsList.firstChild);
        

        topicForm.reset();
        newTopicForm.style.display = 'none';
        
        discussion.querySelector('.reply-btn').addEventListener('click', function() {
            alert('Reply functionality would be implemented here!');
        });
    });
    

    loadPopularBooks();

    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Reply functionality would be implemented here!');
        });
    });
});