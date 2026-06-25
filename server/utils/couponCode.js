import Coupon from '../models/Coupon.js';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomCode(length = 8) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

export async function generateUniqueCouponCode() {
  let code;
  let exists = true;

  while (exists) {
    code = randomCode(8);
    const found = await Coupon.findOne({ code });
    exists = !!found;
  }

  return code;
}
