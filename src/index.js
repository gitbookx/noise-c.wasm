// Generated by LiveScript 1.5.0
/**
 * @package   noise-c.wasm
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright Copyright (c) 2017, Nazar Mokrynskyi
 * @license   MIT License, see license.txt
 */
(function(){
  var constants, lib, allocate, allocate_pointer;
  constants = require('./constants');
  lib = require('../noise-c')();
  module.exports = {
    ready: lib.then,
    constants: constants,
    CipherState: CipherState,
    SymmetricState: SymmetricState,
    HandshakeState: HandshakeState
  };
  allocate = lib.allocateBytes;
  allocate_pointer = lib.allocatePointer;
  function allocate_buffer(data, size){
    var tmp, buffer;
    tmp = allocate_pointer();
    lib._NoiseBuffer_create(tmp, data, size, data.length);
    buffer = tmp.dereference();
    tmp.free();
    return buffer;
  }
  function assert_no_error(error, object_to_free){
    var key, ref$, code;
    if (error === constants.NOISE_ERROR_NONE) {
      return;
    }
    for (key in ref$ = constants) {
      code = ref$[key];
      if (code === error) {
        if (object_to_free) {
          try {
            object_to_free.free();
          } catch (e$) {}
        }
        throw new Error(key);
      }
    }
  }
  /**
   * The CipherState object, API is close to the spec: http://noiseprotocol.org/noise.html#the-cipherstate-object
   *
   * NOTE: If you ever get an exception with Error object, whose message is one of constants.NOISE_ERROR_* keys, object is no longer usable and there is no need
   * to call free() method, as it was called for you automatically already
   *
   * @param {string} cipher constants.NOISE_CIPHER_CHACHAPOLY, constants.NOISE_CIPHER_AESGCM, etc.
   */
  function CipherState(cipher){
    var tmp, error;
    if (!(this instanceof CipherState)) {
      return new CipherState(cipher);
    }
    tmp = allocate_pointer();
    error = lib._noise_cipherstate_new_by_id(tmp, cipher);
    assert_no_error(error, tmp);
    this._state = tmp.dereference();
    this._mac_length = lib._noise_cipherstate_get_mac_length(this._state);
    tmp.free();
  }
  CipherState.prototype = {
    /**
     * @param {Uint8Array} key
     */
    InitializeKey: function(key){
      var error;
      key = allocate(0, key);
      error = lib._noise_cipherstate_init_key(this._state, key, key.length);
      key.free();
      assert_no_error(error, this);
    },
    HasKey: function(){
      return lib._noise_cipherstate_has_key(this._state) === 1;
    }
    /**
     * @param {Uint8Array} ad
     * @param {Uint8Array} plaintext
     *
     * @return {Uint8Array}
     */,
    EncryptWithAd: function(ad, plaintext){
      var buffer, error, ciphertext;
      ad = allocate(0, ad);
      plaintext = allocate(plaintext.length + this._mac_length, plaintext);
      buffer = allocate_buffer(plaintext, plaintext.length - this._mac_length);
      error = lib._noise_cipherstate_encrypt_with_ad(this._state, ad, ad.length, buffer);
      ciphertext = plaintext.get();
      ad.free();
      plaintext.free();
      buffer.free();
      assert_no_error(error, this);
      return ciphertext;
    }
    /**
     * @param {Uint8Array} ad
     * @param {Uint8Array} ciphertext
     *
     * @return {Uint8Array}
     */,
    DecryptWithAd: function(ad, ciphertext){
      var buffer, error, plaintext;
      ad = allocate(0, ad);
      ciphertext = allocate(0, ciphertext);
      buffer = allocate_buffer(ciphertext, ciphertext.length);
      error = lib._noise_cipherstate_decrypt_with_ad(this._state, ad, ad.length, buffer);
      plaintext = ciphertext.get().slice(0, ciphertext.length - this._mac_length);
      ad.free();
      ciphertext.free();
      buffer.free();
      assert_no_error(error, this);
      return plaintext;
    }
    /**
     * @return {boolean}
     */,
    Rekey: function(){
      throw 'Not implemented';
    }
    /**
     * Call this when object is not needed anymore to avoid memory leaks
     */,
    free: function(){
      var error;
      error = lib._noise_cipherstate_free(this._state);
      delete this._state;
      delete this._mac_length;
      assert_no_error(error);
    }
  };
  function CipherState_split(state){
    this._state = state;
    this._mac_length = lib._noise_cipherstate_get_mac_length(this._state);
  }
  CipherState_split.prototype = Object.create(CipherState.prototype);
  Object.defineProperty(CipherState_split.prototype, 'constructor', {
    enumerable: false,
    value: CipherState_split
  });
  /**
   * The SymmetricState object, API is close to the spec: http://noiseprotocol.org/noise.html#the-symmetricstate-object
   *
   * NOTE: If you ever get an exception with Error object, whose message is one of constants.NOISE_ERROR_* keys, object is no longer usable and there is no need
   * to call free() method, as it was called for you automatically already
   *
   * @param {string} protocol_name The name of the Noise protocol to use, for instance, Noise_N_25519_ChaChaPoly_BLAKE2b
   */
  function SymmetricState(protocol_name){
    var tmp, error, this$ = this;
    if (!(this instanceof SymmetricState)) {
      return new SymmetricState(protocol_name);
    }
    tmp = allocate_pointer();
    protocol_name = allocate(0, protocol_name);
    error = lib._noise_symmetricstate_new_by_name(tmp, protocol_name);
    assert_no_error(error, tmp);
    this._state = tmp.dereference();
    tmp.free();
    protocol_name.free();
    Object.defineProperty(this, '_mac_length', {
      configurable: true,
      get: function(){
        var mac_length;
        mac_length = lib._noise_symmetricstate_get_mac_length(this$._state);
        if (mac_length > 0) {
          this$._mac_length = mac_length;
        }
        return mac_length;
      }
    });
  }
  SymmetricState.prototype = {
    /**
     * @param {Uint8Array} input_key_material
     */
    MixKey: function(input_key_material){
      var error;
      input_key_material = allocate(0, input_key_material);
      error = lib._noise_symmetricstate_mix_key(this._state, input_key_material, input_key_material.length);
      input_key_material.free();
      assert_no_error(error, this);
    }
    /**
     * @param {Uint8Array} data
     */,
    MixHash: function(data){
      var error;
      data = allocate(0, data);
      error = lib._noise_symmetricstate_mix_hash(this._state, data, data.length);
      data.free();
      assert_no_error(error, this);
    }
    /**
     * @param {Uint8Array} input_key_material
     */,
    MixKeyAndHash: function(input_key_material){
      var tmp, length, ck, data;
      this.MixKey(input_key_material);
      tmp = allocate_pointer();
      length = lib._SymmetricState_get_ck(this._state, tmp);
      ck = tmp.dereference(length);
      tmp.free();
      data = ck.get();
      ck.free();
      this.MixHash(data);
    }
    /**
     * @param {Uint8Array} plaintext
     *
     * @return {Uint8Array}
     */,
    EncryptAndHash: function(plaintext){
      var buffer, error, ciphertext;
      plaintext = allocate(plaintext.length + this._mac_length, plaintext);
      buffer = allocate_buffer(plaintext, plaintext.length - this._mac_length);
      error = lib._noise_symmetricstate_encrypt_and_hash(this._state, buffer);
      ciphertext = plaintext.get();
      plaintext.free();
      buffer.free();
      assert_no_error(error, this);
      return ciphertext;
    }
    /**
     * @param {Uint8Array} ciphertext
     *
     * @return {Uint8Array}
     */,
    DecryptAndHash: function(ciphertext){
      var buffer, error, plaintext;
      ciphertext = allocate(0, ciphertext);
      buffer = allocate_buffer(ciphertext, ciphertext.length);
      error = lib._noise_symmetricstate_decrypt_and_hash(this._state, buffer);
      plaintext = ciphertext.get().slice(0, ciphertext.length - this._mac_length);
      ciphertext.free();
      buffer.free();
      assert_no_error(error, this);
      return plaintext;
    }
    /**
     * @return {CipherState[]}
     */,
    Split: function(){
      var tmp1, tmp2, error, e, cs1, cs2;
      tmp1 = allocate_pointer();
      tmp2 = allocate_pointer();
      error = lib._noise_symmetricstate_split(this._state, tmp1, tmp2);
      try {
        assert_no_error(error);
      } catch (e$) {
        e = e$;
        tmp1.free();
        tmp2.free();
        throw e;
      }
      cs1 = new CipherState_split(tmp1.dereference());
      cs2 = new CipherState_split(tmp2.dereference());
      tmp1.free();
      tmp2.free();
      try {
        this.free();
      } catch (e$) {
        e = e$;
        try {
          cs1.free();
        } catch (e$) {}
        try {
          cs2.free();
        } catch (e$) {}
        throw e;
      }
      return [cs1, cs2];
    }
    /**
     * Call this when object is not needed anymore to avoid memory leaks
     */,
    free: function(){
      var error;
      error = lib._noise_symmetricstate_free(this._state);
      delete this._state;
      delete this._mac_length;
      assert_no_error(error);
    }
  };
  /**
   * The HandshakeState object, API is close to the spec: http://noiseprotocol.org/noise.html#the-handshakestate-object
   *
   * NOTE: If you ever get an exception with Error object, whose message is one of constants.NOISE_ERROR_* keys, object is no longer usable and there is no need
   * to call free() method, as it was called for you automatically already
   *
   * @param {string}	protocol_name	The name of the Noise protocol to use, for instance, Noise_N_25519_ChaChaPoly_BLAKE2b
   * @param {number}	initiator		The role for the new object, either constants.NOISE_ROLE_INITIATOR or constants.NOISE_ROLE_RESPONDER
   */
  function HandshakeState(protocol_name, role){
    var tmp, error;
    if (!(this instanceof HandshakeState)) {
      return new HandshakeState(protocol_name, role, prologue, s, e, rs, re, psk);
    }
    tmp = allocate_pointer();
    protocol_name = allocate(0, protocol_name);
    error = lib._noise_handshakestate_new_by_name(tmp, protocol_name, role);
    protocol_name.free();
    assert_no_error(error, tmp);
    this._state = tmp.dereference();
    tmp.free();
  }
  HandshakeState.prototype = {
    /**
     * Must be called after object creation and after switch to a fallback handshake.
     *
     * In case of fallback handshake it is not required to specify values that are the same as in previous Initialize() call, those will be used by default
     *
     * @param {null|Uint8Array}	prologue	Prologue value
     * @param {null|Uint8Array}	s			Local static private key
     * @param {null|Uint8Array}	rs			Remote static public key
     * @param {null|Uint8Array}	psk			Pre-shared symmetric key
     */
    Initialize: function(prologue, s, rs, psk){
      var error, dh;
      prologue == null && (prologue = null);
      s == null && (s = null);
      rs == null && (rs = null);
      psk == null && (psk = null);
      if (prologue) {
        prologue = allocate(0, prologue);
        error = lib._noise_handshakestate_set_prologue(this._state, prologue, prologue.length);
        prologue.free();
        assert_no_error(error, this);
      }
      if (psk && lib._noise_handshakestate_needs_pre_shared_key(this._state) === 1) {
        psk = allocate(0, psk);
        error = lib._noise_handshakestate_set_pre_shared_key(this._state, psk, psk.length);
        psk.free();
        assert_no_error(error, this);
      }
      if (lib._noise_handshakestate_needs_local_keypair(this._state) === 1) {
        if (!s) {
          throw new Error('Local static private key (s) required, but not provided');
        }
        dh = lib._noise_handshakestate_get_local_keypair_dh(this._state);
        s = allocate(0, s);
        error = lib._noise_dhstate_set_keypair_private(dh, s, s.length);
        s.free();
        assert_no_error(error, this);
      }
      if (lib._noise_handshakestate_needs_remote_public_key(this._state) === 1) {
        if (!rs) {
          throw new Error('Remote static private key (rs) required, but not provided');
        }
        dh = lib._noise_handshakestate_get_remote_public_key_dh(this._state);
        rs = allocate(0, rs);
        error = lib._noise_dhstate_set_public_key(dh, rs, rs.length);
        rs.free();
        assert_no_error(error, this);
      }
      error = lib._noise_handshakestate_start(this._state);
      assert_no_error(error, this);
    }
    /**
     * @return {number} One of constants.NOISE_ACTION_*
     */,
    GetAction: function(){
      return lib._noise_handshakestate_get_action(this._state);
    }
    /**
     * Might be called when GetAction() returned constants.NOISE_ACTION_FAILED and switching to fallback protocol is desired
     *
     * @param {number} pattern_id One of constants.NOISE_PATTERN_*_FALLBACK*
     */,
    FallbackTo: function(pattern_id){
      var error;
      pattern_id == null && (pattern_id = constants.NOISE_PATTERN_XX_FALLBACK);
      error = lib._noise_handshakestate_fallback_to(pattern_id);
      assert_no_error(error, this);
    }
    /**
     * @param {null|Uint8Array} payload null if no payload is required
     *
     * @return {Uint8Array} Message that should be sent to the other side
     */,
    WriteMessage: function(payload){
      var message, message_buffer, payload_buffer, error, e, message_length, real_message;
      payload == null && (payload = null);
      message = allocate(constants.NOISE_MAX_PAYLOAD_LEN);
      message_buffer = allocate_buffer(message, 0);
      payload_buffer = null;
      if (payload) {
        payload = allocate(0, payload);
        payload_buffer = allocate_buffer(payload, payload.length);
      }
      error = lib._noise_handshakestate_write_message(this._state, message_buffer, payload_buffer);
      if (payload) {
        payload.free();
        payload_buffer.free();
      }
      try {
        assert_no_error(error, this);
      } catch (e$) {
        e = e$;
        message.free();
        message_buffer.free();
        throw e;
      }
      message_length = lib._NoiseBuffer_get_size(message_buffer);
      real_message = message.get().slice(0, message_length);
      message.free();
      message_buffer.free();
      return real_message;
    }
    /**
     * @param {Uint8Array}	message			Message received from the other side
     * @param {boolean}		payload_needed	false if the application does not need the message payload
     *
     * @return {null|Uint8Array}
     */,
    ReadMessage: function(message, payload_needed){
      var message_buffer, payload_buffer, payload, error, e, real_payload, payload_length;
      payload_needed == null && (payload_needed = false);
      message = allocate(0, message);
      message_buffer = allocate_buffer(message, message.length);
      payload_buffer = null;
      if (payload_needed) {
        payload = allocate(constants.NOISE_MAX_PAYLOAD_LEN);
        payload_buffer = allocate_buffer(payload_buffer);
      }
      error = lib._noise_handshakestate_read_message(this._state, message_buffer, payload_buffer);
      message.free();
      message_buffer.free();
      try {
        assert_no_error(error, this);
      } catch (e$) {
        e = e$;
        if (payload_needed) {
          payload.free();
          payload_buffer.free();
        }
        throw e;
      }
      real_payload = null;
      if (payload_needed) {
        payload_length = lib._NoiseBuffer_get_size(payload);
        real_payload = payload.get().slice(0, payload_length);
        payload.free();
        payload_buffer.free();
      }
      real_payload;
    }
    /**
     * @return {CipherState[]} [send, receive]
     */,
    Split: function(){
      var tmp1, tmp2, error, e, cs1, cs2;
      tmp1 = allocate_pointer();
      tmp2 = allocate_pointer();
      error = lib._noise_handshakestate_split(this._state, tmp1, tmp2);
      try {
        assert_no_error(error, this);
      } catch (e$) {
        e = e$;
        tmp1.free();
        tmp2.free();
        throw e;
      }
      cs1 = new CipherState_split(tmp1.dereference());
      cs2 = new CipherState_split(tmp2.dereference());
      tmp1.free();
      tmp2.free();
      try {
        this.free();
      } catch (e$) {
        e = e$;
        try {
          cs1.free();
        } catch (e$) {}
        try {
          cs2.free();
        } catch (e$) {}
        throw e;
      }
      return [cs1, cs2];
    }
    /**
     * Call this when object is not needed anymore to avoid memory leaks
     */,
    free: function(){
      var error;
      error = lib._noise_handshakestate_free(this._state);
      delete this._state;
      assert_no_error(error);
    }
  };
}).call(this);
