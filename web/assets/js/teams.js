// Teams page JavaScript for LHEQ Statistics
class TeamsPage {
    constructor() {
        this.currentData = [];
        this.dataTable = null;
        this.init();
    }

    async init() {
        try {
            const tableBody = document.getElementById('teams-table-body');
            loadingUtils.showLoading(tableBody);

            await dataManager.loadData();
            this.currentData = [...dataManager.teams];
            this.setupEventListeners();
            this.renderTable();

            // Initialize DataTable after DOM update
            if (this.currentData.length > 0) {
                setTimeout(() => {
                    this.initDataTable();
                }, 100);
            }
        } catch (error) {
            console.error('Error loading teams page:', error);
            this.showError();
        }
    }

    initDataTable() {
        if (this.dataTable) {
            this.dataTable.destroy();
        }

        this.dataTable = $('#teams-table').DataTable({
            paging: false,
            searching: false,
            ordering: true,
            info: false,
            columnDefs: [
                { orderable: false, targets: [0, 1] }, // Position and Team columns
                { type: 'num', targets: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] } // Numeric columns
            ],
            order: [[10, 'desc']] // Sort by ~POC column descending by default
        });
    }

    setupEventListeners() {
        // Division filter
        const divisionFilter = document.getElementById('division-filter');
        if (divisionFilter) {
            this.populateDivisionFilter();
            divisionFilter.addEventListener('change', (e) => {
                this.handleDivisionFilter(e.target.value);
            });
        }

        // Tournament toggle
        const tournamentToggle = document.getElementById('include-tournaments');
        if (tournamentToggle) {
            tournamentToggle.addEventListener('change', async (e) => {
                await this.handleTournamentToggle(e.target.checked);
            });
        }
    }

    async handleTournamentToggle(includeTournaments) {
        const tableBody = document.getElementById('teams-table-body');
        loadingUtils.showLoading(tableBody);

        try {
            // Reload data with new tournament setting
            await dataManager.loadData(includeTournaments);

            // Reload the current data
            this.currentData = [...dataManager.teams];

            // Repopulate division filter with new data
            this.populateDivisionFilter();

            // Destroy existing DataTable
            if (this.dataTable) {
                this.dataTable.destroy();
                this.dataTable = null;
            }

            // Re-render table
            this.renderTable();

            // Reinitialize DataTable
            if (this.currentData.length > 0) {
                setTimeout(() => {
                    this.initDataTable();
                }, 100);
            }
        } catch (error) {
            console.error('Error toggling tournament data:', error);
            this.showError();
        }
    }

    populateDivisionFilter() {
        const divisionFilter = document.getElementById('division-filter');

        // Clear existing options except "Toutes les divisions"
        while (divisionFilter.options.length > 1) {
            divisionFilter.remove(1);
        }

        const divisions = new Set();

        // Collect all unique divisions from ALL teams in dataManager (not filtered)
        dataManager.teams.forEach(team => {
            if (team.division) {
                divisions.add(team.division);
            }
        });

        // Add division options to the select
        Array.from(divisions).sort().forEach(division => {
            const option = document.createElement('option');
            option.value = division;
            option.textContent = division;
            divisionFilter.appendChild(option);
        });
    }

    handleDivisionFilter(division) {
        if (!division) {
            // Show all teams
            this.currentData = [...dataManager.teams];
        } else {
            // Filter by division
            this.currentData = dataManager.teams.filter(team => team.division === division);
        }

        // Destroy existing DataTable
        if (this.dataTable) {
            this.dataTable.destroy();
            this.dataTable = null;
        }

        // Re-render table and reinitialize DataTable
        this.renderTable();

        // Only initialize DataTable if we have data
        if (this.currentData.length > 0) {
            setTimeout(() => {
                this.initDataTable();
            }, 100);
        }
    }


    renderTable() {
        const tableBody = document.getElementById('teams-table-body');

        if (!tableBody) {
            console.error('Table body not found');
            return;
        }

        tableBody.innerHTML = '';

        if (this.currentData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="16" class="text-center">Aucune équipe trouvée</td>';
            tableBody.appendChild(row);
            return;
        }

        this.currentData.forEach((team, index) => {
            const row = this.createTeamRow(team, index + 1);
            tableBody.appendChild(row);
        });
    }

    createTeamRow(team, position) {
        const row = document.createElement('tr');

        const pocScore = team.poc_adjusted || team.poc_rating || 1000;
        const pocClass = pocScore > 1000 ? 'positive' : (pocScore < 1000 ? 'negative' : '');

        const totalPoints = team.total_points || (team.points + (team.fair_play_points || 0));
        const fairPlayPoints = team.fair_play_points || 0;
        const overtimeLosses = team.overtime_losses || 0;

        row.innerHTML = `
            <td>${position}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <img src="${team.local_logo || 'assets/logos/default.png'}"
                         alt="${team.name}"
                         class="team-logo"
                         onerror="this.style.display='none'">
                    <strong>${team.name}</strong>
                </div>
            </td>
            <td>${team.games_played}</td>
            <td>${team.wins}</td>
            <td>${team.losses}</td>
            <td>${overtimeLosses}</td>
            <td>${team.ties}</td>
            <td data-order="${team.points}"><strong>${team.points}</strong></td>
            <td>${fairPlayPoints}</td>
            <td data-order="${totalPoints}"><strong>${totalPoints}</strong></td>
            <td class="${pocClass}" data-order="${pocScore}"><strong>${pocScore.toFixed(1)}</strong></td>
            <td>${team.goals_for}</td>
            <td>${team.goals_against}</td>
            <td class="${team.goal_differential >= 0 ? 'positive' : 'negative'}">
                ${team.goal_differential > 0 ? '+' : ''}${team.goal_differential}
            </td>
            <td>${team.penalty_minutes}</td>
            <td>
                <div style="font-size: 0.9rem;">
                    <div>${team.home_wins}-${team.home_losses}-${team.home_ties}</div>
                    <div style="color: #666;">${team.away_wins}-${team.away_losses}-${team.away_ties}</div>
                </div>
            </td>
        `;

        // Add click handler for team details
        row.style.cursor = 'pointer';
        row.title = `Cliquez pour voir les détails de ${team.name}`;
        row.addEventListener('click', () => {
            this.showTeamDetails(team);
        });

        return row;
    }

    showTeamDetails(team) {
        // Navigate to team detail page
        window.location.href = `team-detail.html?id=${team.id}`;
    }

    showError() {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Erreur de chargement des données</h3>
                    <p>Impossible de charger les statistiques des équipes. Veuillez réessayer plus tard.</p>
                </div>
            `;
        }
    }
}

// Add additional CSS for teams page
const style = document.createElement('style');
style.textContent = `
    .positive { color: #28a745; font-weight: 500; }
    .negative { color: #dc3545; font-weight: 500; }

    .teams-table tbody tr:hover {
        background-color: #f8f9fa;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
    }

    .error-message {
        text-align: center;
        padding: 3rem;
        color: #666;
    }

    .team-logo {
        transition: transform 0.2s ease;
    }

    .team-logo:hover {
        transform: scale(1.1);
    }

    @media (max-width: 768px) {
        /* Hide only Home/Away column on tablets */
        .teams-table th:nth-child(13),
        .teams-table td:nth-child(13) {
            display: none;
        }
    }

    @media (max-width: 480px) {
        /* Hide PIM and Home/Away on mobile, keep POC, GF, GA, Diff */
        .teams-table th:nth-child(12),
        .teams-table td:nth-child(12),
        .teams-table th:nth-child(13),
        .teams-table td:nth-child(13) {
            display: none;
        }

        /* Make table text smaller on mobile */
        .teams-table {
            font-size: 0.85rem;
        }
    }
`;
document.head.appendChild(style);

// Initialize teams page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TeamsPage();
});