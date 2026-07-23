/**
 * Français — langue source. Clés STABLES par écran/domaine (décision projet :
 * jamais de phrase comme clé, contrairement à l'app v1). `as const` fait de ce
 * fichier la source de vérité du type des clés (cf. en.ts / index.tsx).
 * Interpolation : {var}.
 */
export const fr = {
  // Navigation / coquille
  'nav.shop': 'Boutique',
  'nav.composer': 'Composer',
  'nav.cart': 'Panier',
  'nav.account': 'Compte',

  // Compte
  'account.title': 'Mon compte',
  'account.guest': 'Invité',
  'account.guestHint': 'Connectez-vous pour retrouver vos commandes',
  'account.connected': 'Connecté',
  'account.signIn': 'Se connecter',
  'account.signUp': 'Créer un compte',
  'account.signOut': 'Se déconnecter',
  'account.orders': 'Mes commandes',
  'account.trackLast': 'Suivre ma dernière commande',
  'account.favorites': 'Mes découpes favorites',
  'account.addresses': 'Mes adresses',
  'account.help': 'Aide & contact',
  'account.language': 'Langue',

  // Étapes de commande (STAGES)
  'order.stage.received': 'Commande reçue',
  'order.stage.preparing': 'En préparation',
  'order.stage.delivering': 'En livraison',
  'order.stage.delivered': 'Livrée',
  'order.cancelled': 'Annulée',

  // Commun (chaînes répétées telles quelles à travers plusieurs écrans)
  'common.viewShop': 'Voir la boutique',
  'common.subtotal': 'Sous-total',
  'common.total': 'Total',
  'common.delivery': 'Livraison',
  'common.free': 'Offerte',
  'common.edit': 'Modifier',
  'common.delete': 'Supprimer',
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.back': 'Retour',
  'common.phone': 'Téléphone',
  'common.phonePlaceholder': '77 123 45 67',
  'common.genericError': 'Une erreur est survenue. Réessayez.',
  'common.orderNotFound': 'Commande introuvable.',

  // Boutique
  'shop.kicker': 'Boucherie halal · Dakar',
  'shop.headingLead': 'Chaque morceau à sa',
  'shop.headingHighlight': 'juste place',
  'shop.subtitle': 'Choisissez vos découpes, nous préparons et livrons à Dakar.',
  'shop.searchPlaceholder': 'Rechercher une découpe…',
  'shop.searchAriaLabel': 'Rechercher une découpe',
  'shop.clearSearch': 'Effacer',
  'shop.sortRelevance': 'Pertinence',
  'shop.sortPriceAsc': 'Prix ↑',
  'shop.sortPriceDesc': 'Prix ↓',
  'shop.resultsFor': '{count} résultat(s) pour « {query} »',
  'shop.cutsCount': '{count} découpe(s)',
  'shop.noResultsTitle': 'Aucune découpe trouvée',
  'shop.noResultsHint': 'Essayez un autre terme de recherche.',

  // Fiche produit
  'product.notFoundTitle': 'Produit',
  'product.notFound': 'Découpe introuvable.',
  'product.removeFavorite': 'Retirer des favoris',
  'product.addFavorite': 'Ajouter aux favoris',
  'product.onAnimal': "Sur l'animal",
  'product.description': "Découpe de {category} sélectionnée le jour même, préparée par nos bouchers et livrée en chaîne du froid maîtrisée. Le poids exact est confirmé avant préparation.",
  'product.addToCart': 'Ajouter au panier',

  // Carte produit (ProductCard)
  'productCard.removeFavorite': 'Retirer {name} des favoris',
  'productCard.addFavorite': 'Ajouter {name} aux favoris',
  'productCard.add': 'Ajouter',
  'productCard.removeQty': 'Retirer {name}',
  'productCard.addQty': 'Ajouter {name}',

  // Schéma de découpe (CutDiagram)
  'cutDiagram.sketchAlt': 'Croquis : {zones}',
  'cutDiagram.wholePoultry': 'Volaille entière',
  'cutDiagram.wholeSelection': "Sélection sur l'ensemble",
  'cutDiagram.cutPoultry': 'Découpe de la volaille',
  'cutDiagram.cutOfAnimal': 'Découpe du {animal}',
  'cutDiagram.animalBoeuf': 'bœuf',
  'cutDiagram.animalMouton': 'mouton',

  // Box composée (Composer + Panier)
  'box.composed': 'Box composée · {count} découpes',

  // Composer ma box
  'composer.title': 'Composer ma box',
  'composer.chartAlt': 'Planche de découpe du bœuf',
  'composer.selection': 'Sélection',
  'composer.perCut': 'soit {amount} la découpe',
  'composer.addToCart': 'Ajouter la box au panier',
  'composer.pickCuts': 'Choisissez vos découpes',
  'composer.priceNote': 'Le prix se met à jour à chaque choix — jamais recalculé côté client au moment de payer.',

  // Panier
  'cart.title': 'Mon panier',
  'cart.emptyTitle': 'Votre panier est vide',
  'cart.emptyHint': 'Parcourez la boutique et ajoutez vos découpes préférées.',
  'cart.items': '{count} article(s)',
  'cart.clear': 'Vider',
  'cart.decrease': 'Retirer',
  'cart.increase': 'Ajouter',
  'cart.deliveryHint': "Frais de livraison calculés à l'étape suivante, selon votre zone.",

  // Checkout / Commander
  'checkout.title': 'Commander',
  'checkout.emptyTitle': 'Panier vide',
  'checkout.sectionContact': 'Vos coordonnées',
  'checkout.fieldName': 'Nom complet',
  'checkout.fieldNamePlaceholder': 'Awa Ndiaye',
  'checkout.fieldEmail': 'E-mail (facultatif)',
  'checkout.sectionDelivery': 'Livraison',
  'checkout.myAddresses': 'Mes adresses',
  'checkout.newAddress': '+ Nouvelle adresse',
  'checkout.fieldLocalite': 'Localité',
  'checkout.localitePlaceholder': 'Tapez votre quartier (ex. Ouakam)',
  'checkout.fieldZone': 'Zone (commune)',
  'checkout.chooseCommune': '— Choisir une commune —',
  'checkout.freeShippingApplied': '🎉 Livraison offerte pour cette commande.',
  'checkout.freeShippingThreshold': "Livraison offerte dès {amount} d'achat.",
  'checkout.deliveryFeeAmount': 'Frais de livraison : {amount}.',
  'checkout.fieldAddress': 'Adresse précise',
  'checkout.addressPlaceholder': 'Rue, immeuble, point de repère',
  'checkout.fieldNote': 'Note pour le livreur (facultatif)',
  'checkout.notePlaceholder': 'Étage, code, horaire…',
  'checkout.sectionPayment': 'Paiement',
  'checkout.payCod': 'À la livraison',
  'checkout.payCodHint': 'Espèces ou Wave/OM au livreur',
  'checkout.payOnline': 'Payer en ligne',
  'checkout.payOnlineHint': 'Orange Money, Wave, carte — via PayTech',
  'checkout.orderError': 'Commande impossible pour le moment. Réessayez.',
  'checkout.submitting': 'Un instant…',
  'checkout.payOnlineCta': 'Payer en ligne · {total}',
  'checkout.confirmCta': 'Valider ma commande · {total}',
  'checkout.noteOnline': 'Paiement sécurisé PayTech. Le poids exact est confirmé avant préparation.',
  'checkout.noteCod': 'Paiement à la livraison. Le poids exact est confirmé avant préparation.',
  'checkout.errorName': 'Nom requis',
  'checkout.errorZoneApi': 'Sélectionnez votre localité dans la liste',
  'checkout.errorZone': 'Choisissez votre zone',
  'checkout.errorAddress': 'Adresse requise',

  // Validation partagée (téléphone / e-mail / nom)
  'auth.phoneInvalid': 'Numéro sénégalais invalide (ex. 77 123 45 67)',
  'auth.emailInvalid': 'E-mail invalide',
  'auth.errorNameRequired': 'Nom requis',
  'auth.emailOptionalLabel': 'E-mail (facultatif)',
  'auth.emailPlaceholder': 'awa@exemple.sn',
  'auth.passwordLabel': 'Mot de passe',
  'auth.passwordPlaceholder': '••••••••',

  // Confirmation de commande
  'confirmation.notFoundTitle': 'Commande',
  'confirmation.title': 'Commande confirmée',
  'confirmation.thanks': 'Merci, {name} !',
  'confirmation.received': 'Votre commande est bien reçue. Nous préparons vos découpes.',
  'confirmation.reference': 'Référence',
  'confirmation.estimatedDelivery': 'Livraison estimée',
  'confirmation.deliveryToPrefix': 'Livraison à',
  'confirmation.paidOnline': ' — payée en ligne ✓',
  'confirmation.payOnDelivery': ' — paiement à la réception.',
  'confirmation.trackOrder': 'Suivre ma commande',
  'confirmation.continueShopping': 'Continuer mes achats',

  // Suivi de commande
  'suivi.notFoundTitle': 'Suivi',
  'suivi.title': 'Suivi de commande',
  'suivi.cancelledTitle': 'Commande annulée',
  'suivi.cancelledHint': 'Aucun montant ne sera débité{refund}.',
  'suivi.refundInProgress': ' — remboursement en cours',
  'suivi.deliveredTo': 'Livrée à {commune}',
  'suivi.estimatedAround': 'Livraison estimée ~ {time}',
  'suivi.estimatedShort': 'estimé ~ {time}',
  'suivi.deliveredMessage': 'Commande livrée. Merci de votre confiance !',
  'suivi.orderHeading': 'Votre commande',
  'suivi.backToShop': 'Retour à la boutique',

  // Mes commandes
  'commandes.title': 'Mes commandes',
  'commandes.emptyTitle': 'Aucune commande',
  'commandes.emptyHint': 'Vos commandes passées apparaîtront ici.',
  'commandes.otherDevice': 'autre appareil',

  // Favoris
  'favoris.emptyTitle': 'Aucun favori',
  'favoris.emptyHint': 'Touchez le cœur sur une découpe pour la retrouver ici.',

  // Adresses
  'adresses.emptyTitle': 'Aucune adresse',
  'adresses.emptyHint': 'Enregistrez une adresse pour commander plus vite.',
  'adresses.default': 'Par défaut',
  'adresses.deliveryFee': 'Livraison {amount}',
  'adresses.setDefault': 'Définir par défaut',
  'adresses.newTitle': 'Nouvelle adresse',
  'adresses.editTitle': 'Modifier l’adresse',
  'adresses.labelField': 'Libellé (facultatif)',
  'adresses.labelPlaceholder': 'Maison, bureau…',
  'adresses.addNew': 'Ajouter une adresse',
  'adresses.done': 'Terminé',

  // Connexion
  'auth.signInTitle': 'Connexion',
  'auth.signInFieldsRequired': 'Renseignez votre numéro et votre mot de passe.',
  'auth.signInError': 'Connexion impossible. Réessayez.',
  'auth.welcomeBack': 'Bon retour 👋',
  'auth.signInSubtitle': 'Connectez-vous pour retrouver vos commandes et adresses.',
  'auth.justRegistered': 'Compte créé ! Connectez-vous pour continuer.',
  'auth.passwordChanged': 'Mot de passe modifié ! Connectez-vous.',
  'auth.signInBusy': 'Connexion…',
  'auth.forgotPassword': 'Mot de passe oublié ?',
  'auth.noAccount': 'Pas encore de compte ?',

  // Inscription
  'auth.joinTitle': 'Rejoignez PROFOOD',
  'auth.errorFirstName': 'Prénom requis',
  'auth.errorPasswordMin': 'Au moins 6 caractères',
  'auth.errorPasswordMatch': 'Les mots de passe ne correspondent pas',
  'auth.errorOtpRequired': 'Saisissez le code reçu par SMS.',
  'auth.firstNameLabel': 'Prénom',
  'auth.firstNamePlaceholder': 'Awa',
  'auth.lastNameLabel': 'Nom',
  'auth.lastNamePlaceholder': 'Ndiaye',
  'auth.confirmPasswordLabel': 'Confirmer le mot de passe',
  'auth.signUpSubtitle': 'Commandez plus vite et suivez vos livraisons.',
  'auth.otpSentTo': 'Entrez le code envoyé par SMS au {phone}.',
  'auth.choosePassword': 'Choisissez votre mot de passe.',
  'auth.creating': 'Création…',
  'auth.sending': 'Envoi…',
  'auth.receiveCode': 'Recevoir le code',
  'auth.otpLabel': 'Code de vérification',
  'auth.verifying': 'Vérification…',
  'auth.verify': 'Vérifier',
  'auth.editInfo': 'Modifier mes informations',
  'auth.hasAccount': 'Déjà un compte ?',

  // Mot de passe oublié
  'auth.forgotPasswordTitle': 'Mot de passe oublié',
  'auth.phoneInvalidPeriod': 'Numéro sénégalais invalide (ex. 77 123 45 67).',
  'auth.passwordMinPeriod': 'Mot de passe : au moins 6 caractères.',
  'auth.passwordMismatchPeriod': 'Les mots de passe ne correspondent pas.',
  'auth.resetTitle': 'Réinitialiser le mot de passe',
  'auth.otpWillBeSent': 'Un code de vérification vous sera envoyé par SMS.',
  'auth.otpSentToShort': 'Entrez le code envoyé au {phone}.',
  'auth.chooseNewPassword': 'Choisissez votre nouveau mot de passe.',
  'auth.newPasswordLabel': 'Nouveau mot de passe',
  'auth.confirmLabel': 'Confirmer',
  'auth.saving': 'Enregistrement…',
  'auth.changePassword': 'Changer le mot de passe',

  // Retour de paiement PayTech
  'paiement.cancelledTitle': 'Paiement annulé',
  'paiement.cancelledHint': "Aucun montant n'a été débité. Votre panier est conservé.",
  'paiement.backToCart': 'Retourner au panier',
  'paiement.title': 'Paiement',
  'paiement.receivedTitle': 'Paiement reçu',
  'paiement.receivedHint': 'Votre commande est confirmée. Retrouvez-la dans votre historique.',
  'paiement.wait': 'Un instant…',

  // Coquille (AppBar)
  'appbar.toggleTheme': 'Changer de thème',
} as const

export type MsgKey = keyof typeof fr
