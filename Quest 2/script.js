document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // Configure marked for safe HTML and code highlighting
    marked.setOptions({
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            }
            return code;
        },
        breaks: true,
        gfm: true
    });

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Format code blocks with copy button
    function formatCodeBlocks(html) {
        return html.replace(/<pre><code class="language-([^"]+)">/g, (match, lang) => {
            return `
                <div class="code-block">
                    <div class="code-block-header">
                        <span>${lang}</span>
                        <button class="copy-button" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">
                            Copy code
                        </button>
                    </div>
                    <pre><code class="language-${lang}">`;
        });
    }

    // Add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        if (isUser) {
            // For user messages, just use text
            messageContent.textContent = content;
        } else {
            // For assistant messages, process markdown and code
            try {
                let htmlContent = marked.parse(content);
                htmlContent = formatCodeBlocks(htmlContent);
                messageContent.innerHTML = htmlContent;

                // Re-trigger Prism highlighting
                messageContent.querySelectorAll('pre code').forEach((block) => {
                    Prism.highlightElement(block);
                });
            } catch (error) {
                console.error('Error parsing markdown:', error);
                messageContent.textContent = content;
            }
        }

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle sending messages
    async function handleSend() {
        const message = userInput.value.trim();
        if (!message) return;

        // Disable send button and show loading state
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        // Add user message to chat
        addMessage(message, true);
        userInput.value = '';
        userInput.style.height = 'auto';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || 'Error processing request');
            }

            if (data.response) {
                addMessage(data.response);
            } else {
                throw new Error('No response from server');
            }

        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
            addMessage('Sorry, there was an error processing your request. Please try again.');
        } finally {
            // Reset send button
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    // Event listeners
    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Add initial greeting
    setTimeout(() => {
        addMessage(`👋 Hi! I'm your AI assistant. I can help you with:

- Writing and explaining code
- Answering questions
- Providing detailed explanations
- And much more!

Try asking me something!`);
    }, 500);
});
