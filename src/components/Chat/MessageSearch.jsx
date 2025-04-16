import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/context/useFirebase';
import { debounce } from 'lodash';

const MessageSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { searchMessages, searchResults, isSearching, clearSearch, setSelectedUser } = useFirebase();

    // Debounce the search to avoid too many queries
    const debouncedSearch = debounce((term) => {
        if (term.trim()) {
            searchMessages(term);
        } else {
            clearSearch();
        }
    }, 500);

    useEffect(() => {
        debouncedSearch(searchTerm);

        // Cleanup debounce on unmount
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleResultClick = (message) => {
        // Set the selected user to the one from this message
        const userId = message.userDetails.id || message.userDetails._id;
        const user = message.userDetails;
        setSelectedUser(user);

        // Clear the search
        setSearchTerm('');
        clearSearch();

        // You might also want to scroll to this specific message
        // This would require additional implementation
    };

    return (
        <div className="message-search">
            <div className="search-input-container">
                <input
                    type="text"
                    placeholder="Search in messages..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                {searchTerm && (
                    <button onClick={() => { setSearchTerm(''); clearSearch(); }} className="clear-search">
                        ×
                    </button>
                )}
            </div>

            {isSearching && <div className="search-loading">Searching...</div>}

            {searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((message) => (
                        <div
                            key={message.id}
                            className="search-result-item"
                            onClick={() => handleResultClick(message)}
                        >
                            <div className="result-user">{message.userDetails.username}</div>
                            <div className="result-message">{message.text}</div>
                            <div className="result-time">
                                {message.createdAt?.toDate ?
                                    message.createdAt.toDate().toLocaleString() :
                                    'Unknown time'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {searchTerm && !isSearching && searchResults.length === 0 && (
                <div className="no-results">No messages found</div>
            )}
        </div>
    );
};

export default MessageSearch;