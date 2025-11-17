// Dashboard JavaScript for LHEQ Statistics homepage
class Dashboard {
    constructor() {
        this.dataTables = {};
        this.init();
    }

    async init() {
        try {
            await dataManager.loadData();
            this.setupEventListeners();
            this.renderDivisionStandings();

            // Initialize DataTables after DOM update
            setTimeout(() => {
                this.initDataTables();
            }, 100);
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError();
        }
    }

    setupEventListeners() {
        // Tournament toggle
        const tournamentToggle = document.getElementById('include-tournaments');
        if (tournamentToggle) {
            tournamentToggle.addEventListener('change', async (e) => {
                await this.handleTournamentToggle(e.target.checked);
            });
        }
    }

    async handleTournamentToggle(includeTournaments) {
        try {
            // Reload data with new tournament setting
            await dataManager.loadData(includeTournaments);

            // Destroy existing DataTables
            Object.values(this.dataTables).forEach(table => {
                if (table) {
                    table.destroy();
                }
            });
            this.dataTables = {};

            // Re-render division standings
            this.renderDivisionStandings();

            // Reinitialize DataTables
            setTimeout(() => {
                this.initDataTables();
            }, 100);
        } catch (error) {
            console.error('Error toggling tournament data:', error);
            this.showError();
        }
    }

    initDataTables() {
        const tableIds = ['entrepot-hockey-table', 'hockey-experts-table', 'sports-rousseau-table'];

        tableIds.forEach(tableId => {
            this.dataTables[tableId] = $(`#${tableId}`).DataTable({
                paging: false,
                searching: false,
                ordering: true,
                info: false,
                columnDefs: [
                    { orderable: false, targets: [0, 1] }, // Position and Team columns
                    { type: 'num', targets: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }, // Numeric columns
                    { orderData: [10], targets: [10] } // ~POC column
                ],
                order: [[10, 'desc']] // Sort by ~POC column descending by default
            });
        });
    }

    renderDivisionStandings() {
        const divisions = {
            "L'Entrepôt du Hockey": 'entrepot-hockey-body',
            'Hockey Experts': 'hockey-experts-body',
            'Sports Rousseau': 'sports-rousseau-body'
        };

        Object.entries(divisions).forEach(([divisionName, bodyId]) => {
            const standingsBody = document.getElementById(bodyId);
            const divisionTeams = dataManager.teams
                .filter(team => team.division === divisionName)
                .sort((a, b) => {
                    // Sort by POC descending, then total points, then goal differential
                    const pocA = a.poc_adjusted || a.poc_rating || 1000;
                    const pocB = b.poc_adjusted || b.poc_rating || 1000;

                    if (pocB !== pocA) {
                        return pocB - pocA;
                    }
                    if (b.total_points !== a.total_points) {
                        return b.total_points - a.total_points;
                    }
                    return b.goal_differential - a.goal_differential;
                });

            standingsBody.innerHTML = '';

            divisionTeams.forEach((team, index) => {
                const pocScore = team.poc_adjusted || team.poc_rating || 1000;
                const pocClass = pocScore > 1000 ? 'positive' : (pocScore < 1000 ? 'negative' : '');
                const totalPoints = team.total_points || (team.points + (team.fair_play_points || 0));
                const fairPlayPoints = team.fair_play_points || 0;
                const overtimeLosses = team.overtime_losses || 0;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <a href="team-detail.html?id=${team.id}" class="team-link">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="${team.local_logo || 'assets/logos/default.png'}"
                                     alt="${team.name}"
                                     class="team-logo"
                                     onerror="this.style.display='none'">
                                <span>${this.truncateTeamName(team.name)}</span>
                            </div>
                        </a>
                    </td>
                    <td>${team.games_played}</td>
                    <td>${team.wins}</td>
                    <td>${team.losses}</td>
                    <td>${overtimeLosses}</td>
                    <td>${team.ties}</td>
                    <td><strong>${team.points}</strong></td>
                    <td>${fairPlayPoints}</td>
                    <td><strong>${totalPoints}</strong></td>
                    <td class="${pocClass}" data-order="${pocScore}"><strong>${pocScore.toFixed(1)}</strong></td>
                    <td>${team.goals_for}</td>
                    <td>${team.goals_against}</td>
                    <td class="${team.goal_differential >= 0 ? 'positive' : 'negative'}">
                        ${team.goal_differential > 0 ? '+' : ''}${team.goal_differential}
                    </td>
                `;
                standingsBody.appendChild(row);
            });
        });
    }


    truncateTeamName(name, maxLength = 20) {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
    }

    showError() {
        const container = document.querySelector('.dashboard');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Erreur de chargement des données</h3>
                    <p>Impossible de charger les statistiques. Veuillez réessayer plus tard.</p>
                </div>
            `;
        }
    }
}

// Add some CSS for positive/negative values and homepage layout
const style = document.createElement('style');
style.textContent = `
    .positive { color: #28a745; }
    .negative { color: #dc3545; }
    .error-message {
        text-align: center;
        padding: 3rem;
        color: #666;
    }

    /* Homepage division tables styling */
    .divisions-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .division-standings {
        min-width: 0;
    }

    /* Make table text smaller on homepage to fit more content */
    .standings-table {
        font-size: 0.9rem;
    }

    .standings-table th,
    .standings-table td {
        padding: 0.75rem 0.5rem;
    }

    /* Team link styling */
    .team-link {
        color: inherit;
        text-decoration: none;
        display: block;
        transition: color 0.2s ease;
    }

    .team-link:hover {
        color: #007bff;
        text-decoration: none;
    }

    .team-link:hover .team-logo {
        opacity: 0.8;
    }

    /* Responsive adjustments for division tables */
    @media (max-width: 768px) {
        .divisions-container {
            gap: 1.5rem;
        }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});