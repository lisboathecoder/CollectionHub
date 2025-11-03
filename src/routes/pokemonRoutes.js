import express from 'express';
import CardsController from '../controllers/Pokémom/cardsController.js';

const router = express.Router();

// List / query
router.get('/cards', CardsController.list);

// By numeric id (avoid collision with composite route). Using a distinct path
// to avoid pattern parsing issues across express versions.
router.get('/cards/id/:id', CardsController.getById)/

// By composite (set + number)
router.get('/cards/:set/:number', CardsController.getByComposite);

router.post('/cards', CardsController.create);
router.put('/cards/:set/:number', CardsController.updateByComposite);
router.delete('/cards/:set/:number', CardsController.removeByComposite);

export default router;
