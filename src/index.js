// Generated by LiveScript 1.5.0
/**
 * @package   noise-c.wasm
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright Copyright (c) 2017, Nazar Mokrynskyi
 * @license   MIT License, see license.txt
 */
(function(){
  var constants, lib, allocate, allocate_buffer, assert_no_error;
  constants = require('./constants');
  lib = require('../noise-c')();
  module.exports = {
    ready: lib.then,
    constants: constants,
    CipherState: CipherState,
    SymmetricState: SymmetricState
  };
  allocate = lib.allocateBytes;
  allocate_buffer = function(data, size){
    var tmp, buffer;
    tmp = lib.allocatePointer();
    lib._NoiseBuffer_create(tmp, data, size, data.length);
    buffer = tmp.dereference();
    tmp.free();
    return buffer;
  };
  assert_no_error = function(result){
    var key, ref$, value;
    if (result === constants.NOISE_ERROR_NONE) {
      return;
    }
    for (key in ref$ = constants) {
      value = ref$[key];
      if (value === result) {
        throw "Error: " + key;
      }
    }
  };
  /**
   * @param {string} cipher constants.NOISE_CIPHER_CHACHAPOLY, constants.NOISE_CIPHER_AESGCM, etc.
   */
  function CipherState(cipher){
    var tmp, result, e;
    if (!(this instanceof CipherState)) {
      return new CipherState(cipher);
    }
    tmp = lib.allocatePointer();
    result = lib._noise_cipherstate_new_by_id(tmp, cipher);
    try {
      assert_no_error(result);
    } catch (e$) {
      e = e$;
      tmp.free();
      throw e;
    }
    this._state = tmp.dereference();
    this._mac_length = lib._noise_cipherstate_get_mac_length(this._state);
    tmp.free();
  }
  CipherState.prototype = {
    /**
     * @param {Uint8Array} key
     */
    InitializeKey: function(key){
      var result;
      key = allocate(0, key);
      result = lib._noise_cipherstate_init_key(this._state, key, key.length);
      key.free();
      assert_no_error(result);
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
      var buffer, result, ciphertext;
      ad = allocate(0, ad);
      plaintext = allocate(plaintext.length + this._mac_length, plaintext);
      buffer = allocate_buffer(plaintext, plaintext.length - this._mac_length);
      result = lib._noise_cipherstate_encrypt_with_ad(this._state, ad, ad.length, buffer);
      ciphertext = plaintext.get();
      ad.free();
      plaintext.free();
      buffer.free();
      assert_no_error(result);
      return ciphertext;
    }
    /**
     * @param {Uint8Array} ad
     * @param {Uint8Array} ciphertext
     *
     * @return {Uint8Array}
     */,
    DecryptWithAd: function(ad, ciphertext){
      var buffer, result, plaintext;
      ad = allocate(0, ad);
      ciphertext = allocate(0, ciphertext);
      buffer = allocate_buffer(ciphertext, ciphertext.length);
      result = lib._noise_cipherstate_decrypt_with_ad(this._state, ad, ad.length, buffer);
      plaintext = ciphertext.get().slice(0, ciphertext.length - this._mac_length);
      ad.free();
      ciphertext.free();
      buffer.free();
      assert_no_error(result);
      return plaintext;
    },
    Rekey: function(){
      throw 'Not implemented';
    },
    free: function(){
      var result;
      result = lib._noise_cipherstate_free(this._state);
      delete this._state;
      delete this._mac_length;
      assert_no_error(result);
    }
  };
  function CipherState_split(state){
    this._state = state;
    this._mac_length = lib._noise_cipherstate_get_mac_length(this._state);
  }
  CipherState_split.prototype = Object.create(CipherState);
  Object.defineProperty(CipherState_split.prototype, 'constructor', {
    enumerable: false,
    value: CipherState_split
  });
  /**
   * @param {string} protocol_name The name of the Noise protocol to use, for instance, Noise_N_25519_ChaChaPoly_BLAKE2b
   */
  function SymmetricState(protocol_name){
    var tmp, result, e;
    if (!(this instanceof SymmetricState)) {
      return new SymmetricState(protocol_name);
    }
    tmp = lib.allocatePointer();
    protocol_name = allocate(0, protocol_name);
    result = lib._noise_symmetricstate_new_by_name(tmp, protocol_name);
    try {
      assert_no_error(result);
    } catch (e$) {
      e = e$;
      tmp.free();
      throw e;
    }
    this._state = tmp.dereference();
    this._mac_length = lib._noise_symmetricstate_get_mac_length(this._state);
    tmp.free();
    protocol_name.free();
  }
  SymmetricState.prototype = {
    /**
     * @param {Uint8Array} input_key_material
     */
    MixKey: function(input_key_material){
      var result;
      input_key_material = allocate(0, input_key_material);
      result = lib._noise_symmetricstate_mix_key(this._state, input_key_material, input_key_material.length);
      input_key_material.free();
      assert_no_error(result);
    }
    /**
     * @param {Uint8Array} data
     */,
    MixHash: function(data){
      var result;
      data = allocate(0, data);
      result = lib._noise_symmetricstate_mix_hash(this._state, data, data.length);
      data.free();
      assert_no_error(result);
    }
    /**
     * @param {Uint8Array} input_key_material
     */,
    MixKeyAndHash: function(input_key_material){
      var tmp, length, ck, data;
      this.MixKey(input_key_material);
      tmp = lib.allocatePointer();
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
      var buffer, result, ciphertext;
      plaintext = allocate(plaintext.length + this._mac_length, plaintext);
      buffer = allocate_buffer(plaintext, plaintext.length - this._mac_length);
      result = lib._noise_symmetricstate_encrypt_and_hash(this._state, buffer);
      ciphertext = plaintext.get();
      plaintext.free();
      buffer.free();
      assert_no_error(result);
      return ciphertext;
    }
    /**
     * @param {Uint8Array} ciphertext
     *
     * @return {Uint8Array}
     */,
    DecryptAndHash: function(ciphertext){
      var buffer, result, plaintext;
      ciphertext = allocate(0, ciphertext);
      buffer = allocate_buffer(ciphertext, ciphertext.length);
      result = lib._noise_symmetricstate_decrypt_and_hash(this._state, buffer);
      plaintext = ciphertext.get().slice(0, ciphertext.length - this._mac_length);
      ciphertext.free();
      buffer.free();
      assert_no_error(result);
      return plaintext;
    }
    /**
     * @return {CipherState[]}
     */,
    Split: function(){
      var tmp1, tmp2, result, e, cs1, cs2;
      tmp1 = lib.allocatePointer();
      tmp2 = lib.allocatePointer();
      result = lib._noise_symmetricstate_split(this._state, tmp1, tmp2);
      try {
        assert_no_error(result);
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
    },
    free: function(){
      var result;
      result = lib._noise_symmetricstate_free(this._state);
      delete this._state;
      delete this._mac_length;
      assert_no_error(result);
    }
  };
}).call(this);
