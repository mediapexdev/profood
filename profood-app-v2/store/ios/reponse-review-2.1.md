# Réponse à Apple — Guideline 2.1 Information Needed (soumission 2.0.0)

Texte à coller dans **Vérification de l'app → Répondre à l'équipe de vérification des apps**,
puis dans le champ **Notes** de la section *Informations de vérification de l'app*.
La vidéo est jointe à la réponse (ou fournie par lien).

Le compte de démonstration doit être renseigné avant l'envoi : l'inscription n'accepte
que les numéros sénégalais, un examinateur ne peut donc pas créer de compte lui-même.

---

Hello,

Thank you for the review. Here is the information requested. The same text has been added
to the Notes field of the App Review Information section.

**1. Screen recording**

A screen recording captured on a physical iPhone running the latest iOS is attached. It starts
with the app launch and shows the typical user flow: browsing the catalogue, composing a box,
placing an order, account registration, sign in, and account deletion.

**2. Purpose and target audience**

Profood is the ordering app of Profood, a halal butcher shop in Dakar, Senegal. Customers browse
cuts of beef, lamb, chicken and offal, compose a box of fresh meat, and have it delivered to their
home in the Dakar area.

The target audience is households in Dakar who buy halal meat regularly. Buying meat by cut and
weight normally requires going to the shop and waiting; the app lets customers choose the exact
cuts they want, see the price and the delivery fee before ordering, and follow the order until it
is delivered.

**3. Setting up and accessing the main features**

An account is not required to browse or to order: the app offers guest checkout. Registration uses
an SMS code and only accepts Senegalese phone numbers, so please use the demo account below
instead of creating one.

Demo account, under "Mon compte" then "Se connecter":
- Phone: DEMO_PHONE
- Password: DEMO_PASSWORD

Main flows:
- Browse: the "Boutique" tab, or "Créer ma Box" on the home screen to compose a box of cuts.
- Order: add items to the cart, then "Commander". Choose the delivery zone and address, then
  select "À la livraison" as the payment method to complete a real order without any payment.
- Track: "Mon compte" then "Mes commandes", or "Suivre ma dernière commande".
- Account deletion: "Mon compte", sign in, then "Supprimer mon compte" at the bottom of the
  screen. Confirm with the account password. The account is deleted and the personal data is
  erased; past orders are kept anonymized for accounting only.
- Language: "Mon compte" then "Langue" switches between French and English.

**4. External services used**

- Our own REST API at api.profood-app.com (Laravel, hosted at LWS): catalogue, accounts, orders.
- PayTech, a Senegalese payment gateway: optional online payment by mobile money or card.
  The "pay on delivery" method does not use it.
- Twilio: SMS verification codes for registration and password reset.
- Postmark: transactional e-mails such as order confirmation and status updates.

The app contains no advertising SDK, no analytics SDK, no third-party login and no AI service.

**5. Regional differences**

There are none. The app behaves identically in every region and the content is the same
everywhere. Only the interface language changes, French by default and English available, and it
is chosen by the user rather than by region. Delivery itself is limited to the Dakar area, which
is stated in the app before ordering.

**6. Regulated industry and third-party material**

Profood is a retail food business, a halal butcher shop selling its own physical goods, and is not
part of a regulated industry as defined in the guidelines. All material in the app, including
product photographs, descriptions, brand and logo, belongs to Profood. No protected third-party
material is used.

Best regards,
El Hadji Ibrahima NDAO
Profood
