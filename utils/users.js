import bcryptjs from "bcryptjs";
const DATABASE = process.env.DATABASE;
const COLECCTION = process.env.USERS_COLECCTION;
const ACTIVE_STATE = "active";
const BLOCKED_STATE = "blocked";
const MSG_INVALID_CREDENTIALS = "Credenciales no validas";
const EXCEPTION_STRATEGY = {
  blocked: () => {
    throw new Error(
      "Su usuario se encuentra bloqueado por seguridad, consulte con su administrador para volver a habilitarlo."
    );
  },
  unverify: () => {
    throw new Error("Su usuario esta en proceso de verificación.");
  },
  payment_blocked: () => {
    throw new Error("Su usuario se encuentra bloqueado por falta de pago.");
  },
};

export async function getUserByEmail(clientmongo, email) {
  const user = await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .findOne({ email: email });
  console.log(user);
  if (!user) {
    throw new Error(MSG_INVALID_CREDENTIALS);
  }
  return user;
}

export function checkUserState(user) {
  const state = user.state;
  if (state !== ACTIVE_STATE && EXCEPTION_STRATEGY[state]) {
    EXCEPTION_STRATEGY[state]();
  }
}
export function initializeAttempts(user) {
  if (user.attemps === undefined) {
    user.attemps = 0;
  }
}

export async function comparePassword(user, password) {
  return await bcryptjs.compare(password, user.password);
}

export async function updateFailedAttempts(clientmongo, email, newAttempts) {
  await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(
      { email: email },
      {
        $set: { attemps: newAttempts },
      }
    );
}

export async function blockUser(clientmongo, email) {
  await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(
      { email: email },
      {
        $set: { state: BLOCKED_STATE, attemps: 0 },
      }
    );
}

export async function resetAttempts(clientmongo, email) {
  await clientmongo
    .db(DATABASE)
    .collection(COLECCTION)
    .updateOne(
      { email: email },
      {
        $set: { attemps: 0 },
      }
    );
}
