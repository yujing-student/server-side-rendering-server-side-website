// Importeer het npm pakket express uit de node_modules map
import express, {json} from 'express'

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// Haal alle images uit de WHOIS API op
const messages = []


const allData_houses = await fetchJson('https://fdnd-agency.directus.app/items/f_houses')
let everything_houses_data = allData_houses.data;//hierin staat alle data

const images_houses = await fetchJson('https://fdnd-agency.directus.app/items/f_houses_files')
let allData_images = images_houses.data;//hierin staat alle data van de images


// console.log('dit is image2',JSON.parse({ image2})+'\n');


// Maak een nieuwe express app aan
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
// bij een async functie word gebruik gemaakt van een promise en dit kan slagen dan gebruik je .then
// en dit kan falen en hiervoor gebruik je een catch om dit op te vangen

//async heb je nodig voor je http afhandeling van je request en response en ik maak gebruik van een try and catch voor
// het opvangen van errors en het afhandelen van errors door async kunnener meerdere taken tegelijk uitgevoerd en terggevegen worden dus niet 1 taak en
// 1 response maar 2 taken en 2 x eenr esponse dat je neit steeds hoeft tewachten

app.get('/', async function (request, response) {
    // Haal alle personen uit de WHOIS API op
    // hier werkt de zoekfunite niet helemaal zoals gehoopt scroll naar het einde van de pagina
    try {
        const userQuery =  request.query; /*dit is het id wat de gebruiker ingeeft bij het zoekvak en die word opgelsagen in een vairable en qeury gebruik je omdat dit een zoekopdracht is*/
        // dit is een queryparameter   https://medium.com/@aidana1529/understanding-the-difference-between-req-params-req-body-and-req-query-e9cf01fc3150
        // const filteredimagesfirst = allData_images.filter(item => item.f_houses_id === 1);
        // console.log(filteredimagesfirst)

        const filterHouses =  allData_houses.data.filter((informationHouses) => { /*dit is een array met daarin de filter waarin de gegevens van een specifieke student staan*/

            let true_or_false;/*deze waarden is leeg omdat dit true of false moet returen */
            let isValid = true;
            for (let key in userQuery) {


                let correctinformation = informationHouses[key] == userQuery[key];//check of dit klopt zo ja dan is correct information true
                // maak gebruik van == omdat de data in de array inforamtion student als "nummer" staat en je typt in je userquery nummer 9
                // zonder "" en als je === maakt dan returnt die false omdat in de database het een string is en je userquery word ogpelsagen als number
                true_or_false = isValid && correctinformation;/*is de ingegeveninformatie juist zo ja return*/
                //     https://www.freecodecamp.org/news/loose-vs-strict-equality-in-javascript/
            }
            return true_or_false;
        });
        filterHouses.forEach(student => {
            console.log(` dit is de de gezochte id huis: ${student.id}, stret name: ${student.street}, hous nr ${student.house_nr}`);
        });
        // res.json({data: filteredStudent})
        // res.render('index', );

// console.log('dit zijn de images',JSON.stringify({ allData_images})+'\n');
        response.render('index', {
            datahouse: filterHouses,
            images: allData_images,
            messages:messages,
            persons:everything_houses_data
            // persons: everything_houses_data,filteredimagesfirst/*hier zeg ik dat iedereen getoond moet worden*/
        });
        // https://dev.to/callmefarad/simple-query-search-in-node-express-api-4c0e

    } catch (err) {
        response.send(err.message)
    }
})
// Maak een POST route voor person
app.post('/', function (request, response) {
    // Er is nog geen afhandeling van POST, redirect naar GET op /
    messages.push(request.body.bericht)/*voeg het bericht van de gerrbuiker toe aan de array*/
    // bericht moet je gebruiken want je hebt name gebruikt bij je form

    // gebruik maken van person zodat je de data kan oproepen
    response.redirect('/');/*het bericht moet weergegeven worden op deze pagina daarom is er een request*/


})

// Maak een GET route voor een detailpagina met een request parameter id


app.get('/person/:id', function (request, response) {
    fetchJson('https://fdnd-agency.directus.app/items/f_houses/' + request.params.id)

        .then((apiData) => {
            // request.params.id gebruik je zodat je de exacte student kan weergeven dit si een routeparmater naar de route van die persoon
            if (apiData.data) {/*als data voer dan dit uit */
                console.log('apidate bestaat u gaat nu naar de person page')
                // info gebruiken om die te linken aan apidata.data
                response.render('person', {person: apiData.data, images:
                    images_houses.data, messages: messages});
                //     messages moet uitgevoerd worden met de meegegeven array


            } else {
                console.log('No data found for person with id: ' + request.params.id);
                //     laat de error zien als de data al niet gevonden word
            }
        })
        .catch((error) => {
            console.error('Error fetching person data:', error);
        });
});


app.post('/person/:id/', function (request, response) {
    // Stap 1: Haal de huidige data op, zodat we altijd up-to-date zijn, en niks weggooien van anderen
    // Haal eerst de huidige gegevens voor deze persoon op, uit de WHOIS API
    fetchJson('https://fdnd-agency.directus.app/items/f_houses/' + request.params.id)
        .then((apiData) => {

            // Het custom field is een String, dus die moeten we eerst
            // omzetten (= parsen) naar een Object, zodat we er mee kunnen werken
            try {
                apiData.data.custom = JSON.parse(apiData.data.custom)
            } catch (e) {
                // de tekst van de error word in de lege {} weergeven dit is zo omdat de informatie geparst word zodat je de error kan zien
                apiData.data.custom = {}
            }


            // Stap 2: Gebruik de data uit het formulier
            // Deze stap zal voor iedereen net even anders zijn, afhankelijk van de functionaliteit

            // Controleer eerst welke actie is uitgevoerd, aan de hand van de submit button
            // Dit kan ook op andere manieren, of in een andere POST route
            if (request.body.actie == 'verstuur') {
                // acite gebruik je omdat je actie in de person ejs hebt staan in de form

                // Als het custom object nog geen messages Array als eigenschap heeft, voeg deze dan toe
                if (!apiData.data.custom.messages) {
                    apiData.data.custom.messages = []
                }

                // Voeg een nieuwe message toe voor deze persoon, aan de hand van het bericht uit het formulier
                apiData.data.custom.messages.push(request.body.message)

            }
            else if (request.body.actie == 'vind-ik-leuk') {
                // als hier op geklikt is dan is dit true
                apiData.data.custom.like = true
                console.log('er is geklikt op vind ik leuk'+ apiData.data.custom.like);
            }

            else if (request.body.actie == 'vind-ik-niet-leuk') {
                // als hier op geklikt is dan is dit true

                apiData.data.custom.like = false
                console.log('er is een 2de klik op vind ik leuk'+ apiData.data.custom.like);

            }
            // Stap 3: Sla de data op in de API

            // Voeg de nieuwe lijst messages toe in de WHOIS API,
            // via een PATCH request
            fetchJson('https://fdnd-agency.directus.app/items/f_houses/person/' + request.params.id,

                {/*dit is de person/9 bijvoorbeeld*/
                //     de body is de payload omdat daar de data aangepast word voor in de server
                method: 'PATCH',/*hier zeg je verander de data*/
                body: JSON.stringify({
                    custom: apiData.data.custom

                    //     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
                }),
                headers: {/*hier word aangegeven dat het om een json gaat*/
                    'Content-type': 'application/json; charset=UTF-8'
                }
            }).then((patchresponse) => {
                // voer dit uit
                console.log(patchresponse);
                response.redirect(303, '/')
            })


        })
})


// in deze code heb ik ebwust gekozen voor asyinc en await omdat de fetchjson een promise is
app.get("/zoeken", async (request, response) => {
    //     // data.data.custom = JSON.parse(data.data.custom);
    // in de request is de url /zoeken?id ingegeven nummer
    try {
        const userQuery = await request.query; /*dit is het id wat de gebruiker ingeeft bij het zoekvak*/

        const filterhouses = await allData_houses.data.filter((informationStudent) => { /*dit is een array met daarin de filter waarin de gegevens van een specifieke student staan*/

            let true_or_false;/*deze waarden is leeg omdat dit true of false moet returen */
            let isValid = true;
            for (let key in userQuery) {
                // console.log(`dit is de key :${key}`)/*ook wel het id*/
                // console.log(`dit is de userquery dus de invoer ${JSON.stringify(userQuery)}`)/*het id nummer user id*/
                // console.log(`dit is de info dus de opgehaalde informatie van die persoon ${JSON.stringify(informationStudent)}`)

                let correctinformation = informationStudent[key] == userQuery[key];//check of dit klopt zo ja dan is correct information true

                true_or_false = isValid && correctinformation;/*is de ingegeveninformatie juist zo ja return*/

                // if(true_or_false == false){deze code staat in comment vanwege het debuggen
                //     console.log('er is geen overeenkomst de student bestaat neit')
                // }
                //
                // if(true_or_false == true){
                //     console.log('de student is gevonden')
                // }
                //     gebruik maken van == instead of === omdat dit false is
                //     https://www.freecodecamp.org/news/loose-vs-strict-equality-in-javascript/
            }
            return true_or_false;
        });
        // res.json({data: filterhouses})
        // res.render('index', );

        response.render('zoeken', {
            datahouse: filterhouses,
            images: allData_images.data,
            data: everything_houses_data
        });
        // https://dev.to/callmefarad/simple-query-search-in-node-express-api-4c0e

    } catch (err) {
        response.send(err.message)
    }
});

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
    // Toon een bericht in de console en geef het poortnummer door
    console.log(`Application started on http://localhost:${app.get('port')}`)
})