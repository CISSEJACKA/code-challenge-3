document.addEventListener('DOMContentLoaded', () => {
    const filmsList = document.getElementById('films');
    const movieDetails = document.getElementById('movie-details');

    // Function to fetch movie details by ID
    async function fetchMovieDetails(id) {
        try {
            const response = await fetch(`http://localhost:3000/films/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    }

    // Function to fetch all movies
    async function fetchAllMovies() {
        try {
            const response = await fetch('http://localhost:3000/films');
            return await response.json();
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    // Function to update movie details section
    function updateMovieDetails(movie) {
        movieDetails.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title} Poster">
            <h2>${movie.title}</h2>
            <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
            <p><strong>Showtime:</strong> ${movie.showtime}</p>
            <p><strong>Description:</strong> ${movie.description}</p>
            <p><strong>Available Tickets:</strong> ${movie.capacity - movie.tickets_sold}</p>
            <button id="buy-ticket">Buy Ticket</button>
        `;
        
        const buyTicketButton = document.getElementById('buy-ticket');
        buyTicketButton.addEventListener('click', async () => {
            if (movie.capacity - movie.tickets_sold > 0) {
                const updatedTicketsSold = movie.tickets_sold + 1;
                try {
                    await fetch(`http://localhost:3000/films/${movie.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ tickets_sold: updatedTicketsSold })
                    });
                    await fetch('http://localhost:3000/tickets', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ film_id: movie.id, number_of_tickets: 1 })
                    });
                    updateMovieDetails(await fetchMovieDetails(movie.id));
                    updateFilmsList(await fetchAllMovies());
                } catch (error) {
                    console.error('Error buying ticket:', error);
                }
            } else {
                alert('This movie is sold out!');
            }
        });
    }

    // Function to update films list
    function updateFilmsList(films) {
        filmsList.innerHTML = films.map(film => `
            <li class="film item ${film.capacity - film.tickets_sold === 0 ? 'sold-out' : ''}" data-id="${film.id}">
                ${film.title}
                <button class="delete">Delete</button>
            </li>
        `).join('');
        
        const deleteButtons = document.querySelectorAll('.delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const filmId = button.parentElement.dataset.id;
                try {
                    await fetch(`http://localhost:3000/films/${filmId}`, {
                        method: 'DELETE'
                    });
                    updateFilmsList(await fetchAllMovies());
                } catch (error) {
                    console.error('Error deleting film:', error);
                }
            });
        });

        const filmItems = document.querySelectorAll('.film.item');
        filmItems.forEach(item => {
            item.addEventListener('click', async () => {
                const filmId = item.dataset.id;
                const selectedMovie = await fetchMovieDetails(filmId);
                updateMovieDetails(selectedMovie);
            });
        });
    }

    // Initialize the application
    async function init() {
        try {
            // Fetch the first movie's details
            const firstMovie = await fetchMovieDetails(1);
            // Update the movie details section
            updateMovieDetails(firstMovie);
            
            // Fetch all movies
            const movies = await fetchAllMovies();
            // Update the films list
            updateFilmsList(movies);
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }

    // Call the init function to start the application
    init();
});
