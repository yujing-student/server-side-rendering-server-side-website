// Importeer het npm pakket express uit de node_modules map
import express, {json} from 'express'

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// Haal alle images uit de WHOIS API op
const messages = []


const allData_houses = await fetchJson('https://fdnd-agency.directus.app/items/f_houses')

const favorite_houses = await fetchJson('https://fdnd-agency.directus.app/items/f_list')

const app = express()

// Stel ejs in als template engine
app.set('view engine', 'ejs')
// gebruik ejs voor het tonen van de informatie aan de gebruiker

// Stel de map met ejs templates in
app.set('views', './views')
// hierdoor word gezegt dat je in de views map moet kijken

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));

// Maak een GET route voor de index


app.get('/', async function (request, response) {
    // Haal alle personen uit de WHOIS API op
    // hier werkt de zoekfunite niet helemaal zoals gehoopt scroll naar het einde van de pagina
    try {
        const userQuery =  request.query; /*dit is het id wat de gebruiker ingeeft bij het zoekvak en die word opgelsagen in een vairable en qeury gebruik je omdat dit een zoekopdracht is*/
        const filterHouses =  allData_houses.data.filter((informationHouses) => { /*dit is een array met daarin de filter waarin de gegevens van een specifieke student staan*/
            let true_or_false;/*deze waarden is leeg omdat dit true of false moet returen */
            let isValid = true;
            for (let key in userQuery) {


                let correctinformation = informationHouses[key] == userQuery[key];//check of dit klopt zo ja dan is correct information true
                true_or_false = isValid && correctinformation;/*is de ingegeveninformatie juist zo ja return*///     https://www.freecodecamp.org/news/loose-vs-strict-equality-in-javascript/
            }
            return true_or_false;
        });

        response.render('index', {
            datahouse: filterHouses,
            messages:messages,
            houses:allData_houses.data
            // persons: allData_houses.data,filteredimagesfirst/*hier zeg ik dat iedereen getoond moet worden*/
        });
        // https://dev.to/callmefarad/simple-query-search-in-node-express-api-4c0e

    } catch (err) {
        response.send(err.message)
    }
})
// Maak een POST route voor house
app.post('/', function (request, response) {
    // Er is nog geen afhandeling van POST, redirect naar GET op /
    messages.push(request.body.bericht)/*voeg het bericht van de gerrbuiker toe aan de array*/
    // bericht moet je gebruiken want je hebt name gebruikt bij je form


    // gebruik maken van house zodat je de data kan oproepen
    response.redirect('/Detailpage/'+request.body.id);/*het bericht moet weergegeven worden op deze pagina daarom is er een request*/

})
// `/Detailpage/${request.params.id}`
// Maak een GET route voor een detailpagina met een request parameter id

app.get('/Detailpage/:id', function (request, response) {
    const id = request.params.id
    fetchJson(`https://fdnd-agency.directus.app/items/f_houses/${id}`)


        .then((apiData) => {
            // request.params.id gebruik je zodat je de exacte student kan weergeven dit si een routeparmater naar de route van die persoon
            if (apiData.data) {/*als data voer dan dit uit */
                console.log('data bestaat u gaat nu naar de Detailpage page'+JSON.stringify(apiData))
                // info gebruiken om die te linken aan apidata.data
                response.render('Detailpage', {house: apiData.data, images:
                    favorite_houses.data, messages: messages});
                //     messages moet uitgevoerd worden met de meegegeven array


            } else {
                console.log('No data found for house with id: ' + request.params.id);
                //     laat de error zien als de data al niet gevonden word
            }
        })
        .catch((error) => {
            console.error('Error fetching house data:', error);
        });
});


app.post('/Detailpage/:id/', function (request, response) {
    // Stap 1: Haal de huidige data op, zodat we altijd up-to-date zijn, en niks weggooien van anderen
    // Haal eerst de huidige gegevens voor deze persoon op, uit de WHOIS API
    const id = request.params.id
    fetchJson(`https://fdnd-agency.directus.app/items/f_houses/Detailpage/${id}`)
        .then((patchresponse) => {
            // voer dit uit
            console.log(patchresponse);
            response.redirect(303, '/Detailpage/'+request.params.id)
        })

})



app.get('/favorite-list', function (request, response) {
    fetchJson('https://fdnd-agency.directus.app/items/f_list')
        .then((favorite_houses) => {
            // console.log('data bestaat u gaat nu naar de favoreiten page'+JSON.stringify(favorite_houses))
            // request.params.id gebruik je zodat je de exacte student kan weergeven dit si een routeparmater naar de route van die persoon
            if (favorite_houses.data) {/*als data voer dan dit uit */

                // 2 arrays vergelijken die returnen true en false
                if (favorite_houses.data.length > 0) {
                    const numbers = favorite_houses.data.map(number => number.house_id);
                    // console.log(JSON.stringify(numbers)+'nummers');
                    const flatNummers = numbers.slice();//dit word een niewe arra

                    // console.log(flatNummers+'refactored ummers zonder 2de haakjes weirn'); // Output: [20, 26, 28, 29, 32, 33, 34]


                    const houses = allData_houses.data.map(house => house.id)
                    // console.log(JSON.stringify(houses)+'galle huizen');


                    if (favorite_houses.data.length > 0) {
                        const secondchekc = flatNummers.every(element => houses.includes(element));//dit is true and false
                        // console.log(`Favorite houses are a subset of all houses: ${secondchekc}`);
                        // info gebruiken om die te linken aan apidata.data


                        response.render('favorite-list', { favorite_houses:
                            favorite_houses.data,
                            allhouses:allData_houses.data,
                            numberssaved:flatNummers
                        });
                    } else {
                        console.log("No favorite houses found.");
                    }

                } else {
                    console.log("No favorite houses found.");
                }


            } else {
                console.log('No data found for favortie house');
                //     laat de error zien als de data al niet gevonden word
            }
        })
        .catch((error) => {
            console.error('Error fetching house data:', error);
        });
});

// https://medium.com/@alizhdanov/list-manipulations-in-javascript-c77ce1f2a234

// in deze code heb ik ebwust gekozen voor asyinc en await omdat de fetchjson een promise is


// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
    // Toon een bericht in de console en geef het poortnummer door
    console.log(`Application started on http://localhost:${app.get('port')}`)
})