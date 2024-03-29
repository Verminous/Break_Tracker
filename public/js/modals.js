'use strict';

console.log("M O D A L S . J S   L O A D E D")

///////// - GET MODALS - /////////

const [myModal_Neg, myModalText_Neg, myModal_Pos, myModalText_Pos] =
    ["#myModal-Neg", "#message-neg", "#myModal-Pos", "#message-pos"].map(document.querySelector.bind(document))

///////// - CLOSE BUTTON - /////////

document.querySelectorAll('.close-neg, .close-pos').forEach(btn => {
    btn.addEventListener('click', () => {
        myModal_Neg.style.display = myModal_Pos.style.display = "none";
        fetch('/clear-message', { method: 'POST' });
    });
});

///////// - MAIN FUNCTION - /////////

const makeApiCall = async (apiEndpoint) => {

    try {
        const response = await fetch(apiEndpoint);
        const { message } = await response.json();
        if (response.status === 200) {
            [myModal_Neg, myModal_Pos].forEach(modal => modal.style.display = 'none');
            myModalText_Pos.innerHTML = message;
            myModal_Pos.style.display = 'block';
        } else if ([401, 500].includes(response.status)) {
            [myModal_Pos, myModal_Neg].forEach(modal => modal.style.display = 'none');
            myModalText_Neg.innerHTML = message;
            myModal_Neg.style.display = 'block';
        }
        fetch('/clear-message', { method: 'POST' });
    } catch (error) {
        //console.error("An error occurred:", error);
    }
}

///////// - GET APIS - /////////

const apiEndpoints = [
    "/api/messaging"
];

apiEndpoints.forEach((apiEndpoint) => {
    makeApiCall(apiEndpoint);
});
